import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import type { Arbre } from './Arbre';
import { ArbreService } from './arbre.service';

@Controller('/arbres')
export class ArbreController {
  private favoriteArbres: Arbre[] = [];
  constructor(private readonly arbreService: ArbreService) {}

  @Post()
  createArbre(@Body() arbre: Arbre): Arbre {
    this.arbreService.addArbre(arbre);
    return this.arbreService.getArbre(arbre.id);
  }

  @Get()
  getArbres(@Query('Commune') commune: string): Arbre[] {
    if (commune) {
      return this.arbreService.getArbresOf(commune);
    }
    return this.arbreService.getAllArbres();
  }

  // Voir la liste des favoris
  @Get('favoris')
  getFavoriteArbres(): Arbre[] {
    return this.favoriteArbres;
  }

  @Get(':id')
  getArbre(@Param('id') id: string): Arbre {
    return this.arbreService.getArbre(id);
  }

  @Delete(':id')
  deleteArbre(@Param('id') id: string): void {
    this.arbreService.remove(id);
  }

  @Post('search')
  @HttpCode(200)
  searchArbres(@Body() { term }: { term: string }): Arbre[] {
    return this.arbreService.search(term);
  }

  // *** Gestion des arbres favoris ***

  // Ajouter un arbre dans les favoris
  @Post('favoris')
  @HttpCode(201)
  addFavoriteArbre(@Body('id') id: string): string {
    const arbre = this.arbreService.getArbre(id);
    if (!arbre) {
      return `Arbre avec l'ID ${id} introuvable.`;
    }
    if (this.favoriteArbres.some(favArbre => favArbre.id === id)) {
      return `Arbre avec l'ID ${id} est déjà dans les favoris.`;
    }
    arbre.est_favori = "oui";
    this.favoriteArbres.push(arbre);
    return `Arbre avec l'ID ${id} ajouté aux favoris.`;
  }

  // Supprimer un arbre des favoris
  @Delete('favoris/:id')
  removeFavoriteArbre(@Param('id') id: string): string {
    const index = this.favoriteArbres.findIndex(favArbre => favArbre.id === id);
    if (index === -1) {
      return `Arbre avec l'ID ${id} n'est pas dans les favoris.`;
    }
    const arbre = this.favoriteArbres[index];
    arbre.est_favori = "non";
    this.favoriteArbres.splice(index, 1);
    return `Arbre avec l'ID ${id} supprimé des favoris.`;
  }
}
