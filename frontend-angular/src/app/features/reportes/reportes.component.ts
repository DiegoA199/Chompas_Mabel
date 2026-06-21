import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ReportesService } from '../../core/services/reportes.service';

@Component({selector:'app-reportes',standalone:true,imports:[CurrencyPipe],templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'})
export class ReportesComponent implements OnInit {
  constructor(public reportes: ReportesService) {}

  ngOnInit(): void {
    this.reportes.cargarDesdeApi();
  }
}
