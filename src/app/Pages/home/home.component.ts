import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerComponent } from '../../Components/player.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PlayerComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {}
