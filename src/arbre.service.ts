import { readFile } from 'node:fs/promises';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { firstValueFrom, map, tap } from 'rxjs';
import { APIArbre } from './APIArbre';
import type { Arbre } from './Arbre';

@Injectable()
export class ArbreService implements OnModuleInit {
  private readonly logger = new Logger(ArbreService.name);
  private readonly storage: Map<string, Arbre> = new Map();

  constructor(private readonly httpService: HttpService) {}

  async onModuleInit() {
    this.logger.log('Loading arbres from file and API');
    await Promise.all([this.loadArbresFromFile(), this.loadArbresFromApi()]);
    this.logger.log(`${this.storage.size} arbres loaded`);
  }

  private async loadArbresFromFile() {}

  private async loadArbresFromApi() {
    await firstValueFrom(
      this.httpService
        .get<APIArbre[]>('https://data.opendatasoft.com/api/explore/v2.1/catalog/datasets/fr-229200506-arbres-remarquables@hauts-de-seine/exports/json?lang=fr&timezone=Europe%2FBerlin')
        .pipe(
          map((response) => response.data),
          map((apiArbres) =>
            apiArbres.map((apiArbre) => ({
              name: apiArbre.nom_francais || "Nom inconnu",
              commune: apiArbre.commune || "Commune inconnue",
              date: apiArbre.date_releve || "Date inconnue",
              latitude: apiArbre.geo_point_2d.lat.toString(),
              longitude: apiArbre.geo_point_2d.lon.toString(),
              envergure: apiArbre.envergure?.toString() || "0",
              circonference: apiArbre.circonference?.toString() || "0",
              hauteur: apiArbre.hauteur?.toString() || "0",
              id: apiArbre.matricule || "ID inconnu",
              est_favori: "non",
              photoUrl: apiArbre.photo?.url || null,
            })),
          ),
          tap((arbres) => arbres.forEach((arbre) => this.addArbre(arbre))),
        ),
    );
  }

  addArbre(arbre: Arbre) {
    this.storage.set(arbre.id, arbre);
  }

  getArbre(id: string): Arbre {
    const arbre = this.storage.get(id);

    if (!arbre) {
      throw new NotFoundException(`Arbre with ID ${id} not found`);
    }

    return arbre;
  }

  getAllArbres(): Arbre[] {
    return Array.from(this.storage.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }

  getArbresOf(commune: string): Arbre[] {
    return this.getAllArbres()
      .filter((arbre) => arbre.commune === commune)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  remove(id: string) {
    this.storage.delete(id);
  }

  search(term: string) {
    return Array.from(this.storage.values())
      .filter((arbre) => arbre.name.includes(term) || arbre.commune.includes(term))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
