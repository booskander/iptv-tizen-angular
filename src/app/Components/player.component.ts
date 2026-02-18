import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import Hls from 'hls.js';

/** Represents a single channel parsed from the m3u playlist */
export interface Channel {
  name: string;
  logo?: string;
  group?: string;
  url: string;
}

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollingModule],
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, OnDestroy {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

  /** The m3u playlist URL (proxied through Angular dev server to bypass CORS) */
  playlistUrl = '/api/get.php?username=SkanderH2706&password=SK270600&type=m3u&output=hls';

  channels: Channel[] = [];
  filteredChannels: Channel[] = [];
  groups: string[] = [];
  selectedChannel?: Channel;
  selectedGroup = '';
  searchQuery = '';
  loading = true;
  error = '';
  isBuffering = false;  // Show loading spinner on video

  // TV UI state
  sidebarOpen = false;
  controlsVisible = true;
  showMoreGroups = false;
  private controlsTimeout?: ReturnType<typeof setTimeout>;
  private hls?: Hls;

  ngOnInit(): void {
    this.initTizen();
    this.loadPlaylist();
    this.startControlsTimer();
  }

  /** Initialize Tizen TV specific features */
  private initTizen(): void {
    // Check if running on Tizen TV
    if (typeof (window as any).tizen !== 'undefined') {
      console.log('Running on Tizen TV');
      
      // Register Tizen remote control keys
      try {
        const tvinputdevice = (window as any).tizen.tvinputdevice;
        const keysToRegister = [
          'MediaPlay', 'MediaPause', 'MediaStop', 'MediaPlayPause',
          'MediaFastForward', 'MediaRewind',
          'ChannelUp', 'ChannelDown',
          'ColorF0Red', 'ColorF1Green', 'ColorF2Yellow', 'ColorF3Blue'
        ];
        keysToRegister.forEach(key => {
          try {
            tvinputdevice.registerKey(key);
          } catch (e) {
            console.log('Could not register key:', key);
          }
        });
        console.log('Tizen remote keys registered');
      } catch (e) {
        console.log('Tizen input device API not available');
      }
    }
  }

  /** Handle keyboard navigation for TV remotes (including Tizen) */
  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    // Tizen TV key codes
    const TIZEN_KEYS: { [key: number]: string } = {
      37: 'ArrowLeft',
      38: 'ArrowUp',
      39: 'ArrowRight',
      40: 'ArrowDown',
      13: 'Enter',
      10009: 'Back',      // Tizen Back button
      10182: 'Exit',      // Tizen Exit button
      415: 'Play',        // Tizen Play
      19: 'Pause',        // Tizen Pause
      413: 'Stop',        // Tizen Stop
      417: 'FastForward', // Tizen FF
      412: 'Rewind',      // Tizen Rewind
      10252: 'PlayPause', // Tizen Play/Pause toggle
      427: 'ChannelUp',   // Tizen CH+
      428: 'ChannelDown', // Tizen CH-
    };

    const key = TIZEN_KEYS[event.keyCode] || event.key;

    switch (key) {
      case 'ArrowRight':
        if (!this.sidebarOpen) {
          this.sidebarOpen = true;
          event.preventDefault();
        }
        break;
      case 'ArrowLeft':
      case 'Escape':
      case 'Back':
        if (this.sidebarOpen) {
          this.sidebarOpen = false;
          event.preventDefault();
        }
        break;
      case 'Backspace':
        if (this.sidebarOpen && !this.searchQuery) {
          this.sidebarOpen = false;
          event.preventDefault();
        }
        break;
      case 'Play':
      case 'PlayPause':
        this.togglePlayPause();
        event.preventDefault();
        break;
      case 'Pause':
      case 'Stop':
        this.videoRef?.nativeElement?.pause();
        event.preventDefault();
        break;
      case 'ChannelUp':
        this.playNextChannel();
        event.preventDefault();
        break;
      case 'ChannelDown':
        this.playPreviousChannel();
        event.preventDefault();
        break;
      case 'Exit':
        // On Tizen, you might want to minimize or exit
        if (typeof (window as any).tizen !== 'undefined') {
          (window as any).tizen.application.getCurrentApplication().exit();
        }
        break;
    }
    this.showControls();
  }

  /** Toggle play/pause state */
  togglePlayPause(): void {
    const video = this.videoRef?.nativeElement;
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  }

  /** Play the next channel in the list */
  playNextChannel(): void {
    if (!this.selectedChannel || this.filteredChannels.length === 0) return;
    const currentIndex = this.filteredChannels.findIndex(ch => ch.url === this.selectedChannel?.url);
    const nextIndex = (currentIndex + 1) % this.filteredChannels.length;
    this.playChannel(this.filteredChannels[nextIndex]);
  }

  /** Play the previous channel in the list */
  playPreviousChannel(): void {
    if (!this.selectedChannel || this.filteredChannels.length === 0) return;
    const currentIndex = this.filteredChannels.findIndex(ch => ch.url === this.selectedChannel?.url);
    const prevIndex = currentIndex <= 0 ? this.filteredChannels.length - 1 : currentIndex - 1;
    this.playChannel(this.filteredChannels[prevIndex]);
  }

  /** Show controls and reset auto-hide timer */
  showControls(): void {
    this.controlsVisible = true;
    this.startControlsTimer();
  }

  /** Toggle controls visibility */
  toggleControls(): void {
    this.controlsVisible = !this.controlsVisible;
    if (this.controlsVisible) {
      this.startControlsTimer();
    }
  }

  /** Start timer to auto-hide controls */
  private startControlsTimer(): void {
    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
    }
    this.controlsTimeout = setTimeout(() => {
      if (!this.sidebarOpen) {
        this.controlsVisible = false;
      }
    }, 4000);
  }

  /** Toggle sidebar visibility */
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
    if (this.sidebarOpen) {
      setTimeout(() => this.searchInputRef?.nativeElement?.focus(), 100);
    }
  }

  /** Select a category/group */
  selectGroup(group: string): void {
    this.selectedGroup = group;
    this.filterChannels();
  }

  /** Filter channels by search and group */
  filterChannels(): void {
    const q = this.searchQuery.toLowerCase();
    this.filteredChannels = this.channels.filter((ch) => {
      const matchesSearch = !q || 
        ch.name.toLowerCase().includes(q) ||
        (ch.group?.toLowerCase().includes(q) ?? false);
      const matchesGroup = !this.selectedGroup || ch.group === this.selectedGroup;
      return matchesSearch && matchesGroup;
    });
  }

  /** Fetch and parse the m3u playlist */
  async loadPlaylist(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      const res = await fetch(this.playlistUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      this.channels = this.parseM3U(text);
      this.filteredChannels = this.channels;
      
      // Extract unique groups
      const groupSet = new Set<string>();
      this.channels.forEach(ch => {
        if (ch.group) groupSet.add(ch.group);
      });
      this.groups = Array.from(groupSet).sort();
      
      console.log('Loaded', this.channels.length, 'channels in', this.groups.length, 'groups');
    } catch (e: any) {
      this.error = `Failed to load playlist: ${e.message}`;
      console.error('Playlist load error:', e);
    } finally {
      this.loading = false;
    }
  }

  /** Parse m3u text into Channel array */
  parseM3U(text: string): Channel[] {
    const lines = text.split(/\r?\n/);
    const channels: Channel[] = [];
    let current: Partial<Channel> = {};

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('#EXTINF:')) {
        // Parse attributes like tvg-name, tvg-logo, group-title
        const nameMatch = trimmed.match(/,(.+)$/);
        const logoMatch = trimmed.match(/tvg-logo="([^"]+)"/);
        const groupMatch = trimmed.match(/group-title="([^"]+)"/);
        current = {
          name: nameMatch?.[1]?.trim() || 'Unknown',
          logo: logoMatch?.[1],
          group: groupMatch?.[1]
        };
      } else if (trimmed && !trimmed.startsWith('#')) {
        // This is the URL line
        if (current.name) {
          channels.push({ ...current, url: trimmed } as Channel);
        }
        current = {};
      }
    }
    return channels;
  }

  /** Filter channels by search query */
  onSearch(): void {
    this.filterChannels();
  }

  /** Handle keydown in search input */
  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.searchQuery = '';
      this.filterChannels();
      this.searchInputRef?.nativeElement?.blur();
    } else if (event.key === 'ArrowDown') {
      // Focus first channel
      const firstChannel = document.querySelector('.channel-item') as HTMLElement;
      firstChannel?.focus();
      event.preventDefault();
    }
  }

  /** Handle keydown on category buttons */
  onCategoryKeydown(event: KeyboardEvent, group: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      this.selectGroup(group);
      event.preventDefault();
    }
  }

  /** Handle keydown on channel items */
  onChannelKeydown(event: KeyboardEvent, channel: Channel): void {
    if (event.key === 'Enter' || event.key === ' ') {
      this.playChannel(channel);
      this.sidebarOpen = false;
      event.preventDefault();
    }
  }

  /** TrackBy function for virtual scroll performance */
  trackByUrl(_index: number, channel: Channel): string {
    return channel.url;
  }

  /** Play a channel */
  async playChannel(channel: Channel): Promise<void> {
    // Immediately update UI
    this.selectedChannel = channel;
    this.error = '';
    this.isBuffering = true;
    this.sidebarOpen = false;
    this.showControls();

    // Wait for view update (minimal delay)
    await new Promise(resolve => setTimeout(resolve, 0));
    
    const video = this.videoRef?.nativeElement;
    if (!video) {
      this.error = 'Video element not found';
      this.isBuffering = false;
      return;
    }

    // === THOROUGH CLEANUP OF PREVIOUS STREAM ===
    // Stop loading and destroy HLS instance completely
    if (this.hls) {
      this.hls.stopLoad();
      this.hls.detachMedia();
      this.hls.destroy();
      this.hls = undefined;
    }

    // Fully reset video element and clear any buffered data
    video.pause();
    video.removeAttribute('src');
    video.load();
    
    // Clear any media source buffers
    if (video.srcObject) {
      video.srcObject = null;
    }

    // Use original URL directly
    const streamUrl = channel.url;
    console.log('Playing:', channel.name);

    // Always use hls.js for better control over IPTV streams
    if (Hls.isSupported()) {
      this.hls = new Hls({
        debug: false,
        enableWorker: true,
        // === BUFFER SETTINGS (prioritize stability over low latency) ===
        lowLatencyMode: false,          // Disable for more stable playback
        backBufferLength: 60,           // Keep 60s back buffer
        maxBufferLength: 60,            // Buffer 60s ahead (very stable)
        maxMaxBufferLength: 120,        // Allow up to 2min buffer
        maxBufferSize: 100 * 1000000,   // 100MB max buffer
        maxBufferHole: 0.5,             // Max gap to jump over
        // ABR settings - be very conservative
        startLevel: 0,                  // Start with lowest quality for fast startup
        abrEwmaDefaultEstimate: 2000000, // Assume 2Mbps initially (very conservative)
        abrEwmaFastLive: 5,             // Slower ABR adaptation
        abrEwmaSlowLive: 15,
        abrBandWidthFactor: 0.7,        // Use only 70% of measured bandwidth
        abrBandWidthUpFactor: 0.5,      // Very conservative when upgrading quality
        // Timeouts and retries (very generous for weak streams)
        manifestLoadingTimeOut: 20000,  // 20s timeout for slow servers
        manifestLoadingMaxRetry: 5,
        levelLoadingTimeOut: 20000,
        levelLoadingMaxRetry: 6,
        fragLoadingTimeOut: 30000,      // 30s timeout for fragments
        fragLoadingMaxRetry: 10,        // Many retries for unreliable streams
        // Startup
        startFragPrefetch: true,
        // Live stream settings - stay far from live edge
        liveSyncDurationCount: 5,       // Stay 5 segments behind live edge
        liveMaxLatencyDurationCount: 20, // Allow lots of latency before catching up
        liveDurationInfinity: true,     // Treat live streams as infinite
        liveBackBufferLength: 60,       // Keep 60s of live back buffer
        // Error recovery
        appendErrorMaxRetry: 8,         // Retry append errors many times
        // Progressive loading - helps with slow connections
        progressive: true,
      });
      
      this.hls.loadSource(streamUrl);
      this.hls.attachMedia(video);

      // Start playing as soon as first data arrives
      this.hls.on(Hls.Events.FRAG_LOADED, () => {
        if (this.isBuffering) {
          this.isBuffering = false;
        }
      });
      
      this.hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        console.log('✓ Stream loaded:', channel.name, '- Quality levels:', data.levels.length);
        video.play().catch((err) => {
          console.error('Play error:', err);
          this.error = `Cannot play: ${err.message}`;
          this.isBuffering = false;
        });
      });

      this.hls.on(Hls.Events.MANIFEST_LOADING, () => {
        console.log('Loading manifest...');
      });
      
      this.hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.error('✗ Stream failed:', channel.name, '-', data.type, data.details);
          this.isBuffering = false;
          
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (data.details === 'manifestLoadError') {
                this.error = 'Channel unavailable - failed to connect';
              } else if (data.details === 'manifestLoadTimeOut') {
                this.error = 'Channel timeout - server not responding';
              } else if (data.details === 'levelLoadError') {
                this.error = 'Channel offline - video data unavailable';
              } else if (data.details === 'fragLoadError') {
                // Try to recover silently from fragment load errors
                console.log('Fragment load error, attempting recovery...');
                this.hls?.startLoad();
              } else {
                this.error = `Connection error - try another channel`;
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              // Silently recover from media errors
              console.log('Media error, attempting recovery...');
              this.hls?.recoverMediaError();
              break;
            default:
              this.error = `Stream error - try another channel`;
              this.hls?.destroy();
              break;
          }
        } else {
          // Non-fatal errors - handle silently
          if (data.details === 'bufferStalledError') {
            // Buffer stall - this is common, just show buffering indicator
            this.isBuffering = true;
            console.log('Buffer stalled, waiting for data...');
          } else if (data.details === 'levelLoadError') {
            console.log('Level load failed, HLS will try next quality level');
          }
          // Don't log other non-fatal warnings to reduce console noise
        }
      });
    } 
    // Fallback for Safari (native HLS support)
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      console.log('Using native HLS (Safari)');
      video.src = streamUrl;
      
      video.oncanplay = () => {
        this.isBuffering = false;
      };
      
      video.onerror = () => {
        const mediaError = video.error;
        console.error('Native playback error:', mediaError);
        this.error = `Playback failed: ${mediaError?.message || 'Unknown error'}`;
        this.isBuffering = false;
      };
      
      video.play().catch((err) => {
        console.error('Play error:', err);
        this.error = `Cannot play: ${err.message}`;
        this.isBuffering = false;
      });
    } else {
      this.error = 'HLS playback is not supported in this browser';
      this.isBuffering = false;
      console.error('HLS not supported');
    }
  }

  ngOnDestroy(): void {
    // Thorough cleanup on component destroy
    if (this.hls) {
      this.hls.stopLoad();
      this.hls.detachMedia();
      this.hls.destroy();
      this.hls = undefined;
      console.log("Player component has been destroyed");
    }
    
    // Clean up video element
    const video = this.videoRef?.nativeElement;
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
      if (video.srcObject) {
        video.srcObject = null;
      }
    }
    
    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
    }
  }
}
