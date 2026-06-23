import { Component, input, output, signal, computed, effect, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Vehiculo } from '../../models/vehicle/vehicle.model';
import { Sucursal } from '../../models/admin/branch.model';
import { ServicioAdicional, CreateReservaRequest } from '../../models/rental/rental.model';
import { formatCountdown, format12hDateTime, getPeruvianNow } from '../../utils/date-utils';

interface ServicioSeleccionado {
  id: string;
  cantidad: number;
}

@Component({
  selector: 'app-reserva-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reserva-modal.component.html',
  styleUrl: './reserva-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservaModalComponent implements OnInit, OnDestroy {
  vehicle = input.required<Vehiculo>();
  servicios = input<ServicioAdicional[]>([]);
  sucursales = input<Sucursal[] | null>(null);
  sucursalRecojoId = input<string>('');
  sucursalRecojoNombre = input<string>('');
  sucursalRecojoDireccion = input<string>('');
  sucursalDevolucionId = input<string>('');
  showCountdown = input<boolean>(false);
  enviando = input<boolean>(false);

  confirm = output<CreateReservaRequest>();
  cancel = output<void>();

  fechaInicio = signal('');
  fechaFin = signal('');
  terminosAceptados = signal(false);
  serviciosSeleccionados = signal<ServicioSeleccionado[]>([]);
  sucursalDevolucionIdState = signal('');

  private now = signal(Date.now());
  private timerRef: ReturnType<typeof setInterval> | null = null;

  private bodyLock = effect(() => {
    document.body.style.overflow = 'hidden';
  });

  ngOnInit() {
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    this.fechaInicio.set(this.toDateInputValue(manana));
    const fin = new Date(manana);
    fin.setDate(fin.getDate() + 1);
    this.fechaFin.set(this.toDateInputValue(fin));

    this.sucursalDevolucionIdState.set(this.sucursalDevolucionId());

    if (this.showCountdown()) {
      this.timerRef = setInterval(() => this.now.set(Date.now()), 1000);
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
    if (this.timerRef) clearInterval(this.timerRef);
  }

  pickupCountdown = computed(() => {
    this.now();
    const pickup = getPeruvianNow().getTime() + 60 * 60 * 1000;
    const diff = pickup - Date.now();
    if (diff <= 0) return '00:00:00';
    return formatCountdown(diff);
  });

  pickupTimeLabel = computed(() => {
    const ahora = getPeruvianNow();
    const pickup = new Date(ahora.getTime() + 60 * 60 * 1000);
    return format12hDateTime(pickup);
  });

  returnTimeLabel = computed(() => {
    if (!this.fechaInicio() || !this.fechaFin()) return '';
    const inicio = new Date(this.fechaInicio());
    const fin = new Date(this.fechaFin());
    const dias = Math.max(1, Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)));
    const ahora = getPeruvianNow();
    const retorno = new Date(ahora.getTime() + 60 * 60 * 1000 + dias * 24 * 60 * 60 * 1000);
    return format12hDateTime(retorno);
  });

  minDate(): string {
    return this.toDateInputValue(new Date());
  }

  minFechaFin = computed(() => {
    if (!this.fechaInicio()) return this.minDate();
    const d = new Date(this.fechaInicio());
    d.setDate(d.getDate() + 1);
    return this.toDateInputValue(d);
  });

  errorFecha = computed(() => {
    if (!this.fechaInicio() || !this.fechaFin()) return '';
    const inicio = new Date(this.fechaInicio());
    const fin = new Date(this.fechaFin());
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) return '';
    const diffMs = fin.getTime() - inicio.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours < 24) return 'El alquiler mínimo es de 24 horas (1 día completo)';
    if (diffMs > 30 * 24 * 60 * 60 * 1000) return 'El alquiler máximo es de 30 días';
    return '';
  });

  toggleServicio(servicioId: string, checked: boolean): void {
    if (checked) {
      this.serviciosSeleccionados.update(list => [...list, { id: servicioId, cantidad: 1 }]);
    } else {
      this.serviciosSeleccionados.update(list => list.filter(s => s.id !== servicioId));
    }
  }

  isServicioSelected(servicioId: string): boolean {
    return this.serviciosSeleccionados().some(s => s.id === servicioId);
  }

  getCalculos() {
    const v = this.vehicle();
    if (!v || !this.fechaInicio() || !this.fechaFin()) {
      return { dias: 0, tarifaDiaria: 0, base: 0, serviciosTotal: 0, impuestos: 0, total: 0, deposito: 0 };
    }
    const inicio = new Date(this.fechaInicio());
    const fin = new Date(this.fechaFin());
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      return { dias: 0, tarifaDiaria: 0, base: 0, serviciosTotal: 0, impuestos: 0, total: 0, deposito: 0 };
    }
    const diffMs = fin.getTime() - inicio.getTime();
    const dias = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const tarifaDiaria = Number(v.precio_diario_personalizado || v.categoria?.precio_diario_base || 0);
    const base = tarifaDiaria * dias;
    let serviciosTotal = 0;
    for (const sel of this.serviciosSeleccionados()) {
      const sv = this.servicios().find((s: any) => s.id === sel.id);
      if (sv) {
        serviciosTotal += sv.tipo_cobro === 'DIARIO' ? Number(sv.precio) * dias : Number(sv.precio);
      }
    }
    const impuestos = (base + serviciosTotal) * 0.18;
    const total = base + serviciosTotal + impuestos;
    const deposito = total * 0.3;
    return { dias, tarifaDiaria, base, serviciosTotal, impuestos, total, deposito };
  }

  onFechaInicioChange(value: string): void {
    this.fechaInicio.set(value);
    if (this.fechaFin() && this.fechaFin() <= value) {
      const d = new Date(value);
      d.setDate(d.getDate() + 1);
      this.fechaFin.set(this.toDateInputValue(d));
    }
  }

  onFechaFinChange(value: string): void {
    if (this.fechaInicio() && value <= this.fechaInicio()) {
      const d = new Date(this.fechaInicio());
      d.setDate(d.getDate() + 1);
      this.fechaFin.set(this.toDateInputValue(d));
      return;
    }
    this.fechaFin.set(value);
  }

  submit(): void {
    const v = this.vehicle();
    if (!v || !this.fechaInicio() || !this.fechaFin()) return;
    if (this.errorFecha() || !this.terminosAceptados()) return;

    const todayStr = this.toDateInputValue(new Date());
    const isToday = this.fechaInicio() === todayStr;

    const dto: CreateReservaRequest = {
      vehiculo_id: v.id,
      sucursal_recojo_id: this.sucursalRecojoId(),
      sucursal_devolucion_id: this.sucursalDevolucionIdState(),
      fecha_inicio: isToday ? undefined : this.toPeruvianDate(this.fechaInicio()) + ' 00:00:00',
      fecha_fin: this.toPeruvianDate(this.fechaFin()),
      servicios_adicionales: this.serviciosSeleccionados().length > 0
        ? this.serviciosSeleccionados().map(s => ({ servicio_adicional_id: s.id, cantidad: s.cantidad }))
        : undefined,
      metodo_pago: 'TARJETA_CREDITO',
    };

    this.confirm.emit(dto);
  }

  close(): void {
    this.cancel.emit();
  }

  toDateInputValue(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  private toPeruvianDate(value: string): string {
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
  }
}
