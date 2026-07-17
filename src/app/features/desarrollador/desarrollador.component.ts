import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-desarrollador',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './desarrollador.component.html',
  styleUrl: './desarrollador.component.scss',
})
export default class DesarrolladorComponent {
  private readonly http = inject(HttpClient);

  readonly email = signal('');
  readonly loading = signal(false);
  readonly successMsg = signal('');
  readonly errorMsg = signal('');
  readonly generatedKey = signal('');
  readonly keyCopied = signal(false);

  // Code examples stored as strings to avoid template parsing issues
  code_curl_generic = `curl -X GET "https://api.tudominio.com/vehiculos" \\\n  -H "x-api-key: carrent_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p"`;

  code_python_generic = `import requests\n\nAPI_KEY = "carrent_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p"\nBASE_URL = "https://api.tudominio.com"\nHEADERS = {"x-api-key": API_KEY}\n\nresponse = requests.get(f"{BASE_URL}/vehiculos", headers=HEADERS)\nprint(response.json())`;

  code_ruby_generic = `require 'net/http'\nrequire 'json'\n\napi_key = "carrent_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p"\nbase_url = "https://api.tudominio.com"\nheaders = { "x-api-key" => api_key }\n\nuri = URI("#{base_url}/vehiculos")\nresponse = Net::HTTP.get_response(uri, headers)\nputs JSON.parse(response.body)`;

  code_js_generic = `const API_KEY = "carrent_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p";\nconst BASE_URL = "https://api.tudominio.com";\nconst HEADERS = { "x-api-key": API_KEY, "Content-Type": "application/json" };\n\nfetch(\`$\{BASE_URL}/vehiculos\`, { headers: HEADERS })\n  .then(res => res.json())\n  .then(data => console.log(data));`;

  code_curl_vehiculos = `curl -X GET "https://api.tudominio.com/vehiculos?page=1&limit=10" \\\n  -H "x-api-key: carrent_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p"`;

  code_python_vehiculos = `import requests\nr = requests.get("https://api.tudominio.com/vehiculos",\n  headers={"x-api-key": "carrent_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p"},\n  params={"page": 1, "limit": 10})\nprint(r.json())`;

  code_ruby_vehiculos = `uri = URI("https://api.tudominio.com/vehiculos")\nuri.query = URI.encode_www_form({ page: 1, limit: 10 })\nputs JSON.parse(Net::HTTP.get_response(uri, {"x-api-key" => "carrent_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p"}).body)`;

  code_js_vehiculos = `const p = new URLSearchParams({ page: 1, limit: 10 });\nfetch(\`https://api.tudominio.com/vehiculos?$\{p}\`, {\n  headers: { "x-api-key": "carrent_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p" }\n}).then(r => r.json()).then(console.log);`;

  code_curl_health = `curl -X GET "https://api.tudominio.com/health"`;
  code_python_health = `import requests\nprint(requests.get("https://api.tudominio.com/health").json())`;
  code_ruby_health = `require 'net/http'\nputs Net::HTTP.get(URI("https://api.tudominio.com/health"))`;
  code_js_health = `fetch("https://api.tudominio.com/health").then(r => r.json()).then(console.log)`;

  // Response format examples
  code_success = `{\n  "status": 200,\n  "message": "Operacion exitosa",\n  "data": { ... },\n  "error": null\n}`;

  code_pagination = `{\n  "status": 200,\n  "message": "Registros obtenidos",\n  "data": [...],\n  "pagination": {\n    "page": 1,\n    "limit": 10,\n    "total": 42\n  },\n  "error": null\n}`;

  code_error = `{\n  "status": 401,\n  "message": "API Key invalida o expirada",\n  "data": null,\n  "error": {\n    "code": "UNAUTHORIZED",\n    "details": "La API Key proporcionada no es valida o ha expirado"\n  }\n}`;

  generarApiKey(): void {
    const emailValue = this.email().trim();
    if (!emailValue || !emailValue.includes('@')) {
      this.errorMsg.set('Ingresa un correo electrónico válido.');
      this.successMsg.set('');
      return;
    }

    this.loading.set(true);
    this.successMsg.set('');
    this.errorMsg.set('');
    this.generatedKey.set('');
    this.keyCopied.set(false);

    this.http.post<any>(`${environment.apiUrl}/api-key/generar`, { email: emailValue }).subscribe({
      next: (res) => {
        const data = res.data;
        if (data.enviado) {
          this.successMsg.set(`API Key enviada a ${emailValue}. Revisa tu bandeja de entrada.`);
        } else {
          this.generatedKey.set(data.apiKey);
          this.successMsg.set('API Key generada. Cópiala ahora, no se mostrará nuevamente.');
        }
        this.email.set('');
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message ?? 'Error al generar la API Key.');
        this.loading.set(false);
      },
    });
  }

  copiarAlPortapapeles(): void {
    navigator.clipboard.writeText(this.generatedKey()).then(() => {
      this.keyCopied.set(true);
      setTimeout(() => this.keyCopied.set(false), 3000);
    });
  }
}
