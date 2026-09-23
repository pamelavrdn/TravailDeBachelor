<template>
  <div>
    <b-container>
      <b-row class="align-items-start">
        <b-col cols="12">
          <b-row>
            <!-- Filtre par marques -->
            <b-col cols="auto">
              <b-button :variant="activeFilter === 'brands' ? 'secondary' : 'outline-secondary'"
                @click="toggleFilter('brands')">
                Filter by brand
              </b-button>
            </b-col>
            <!-- Filtre par couleurs -->
            <b-col cols="auto">
              <b-button :variant="activeFilter === 'colors' ? 'secondary' : 'outline-secondary'"
                @click="toggleFilter('colors')">
                Filter by color
              </b-button>
            </b-col>
            <!-- Filtre par tailles -->
            <b-col cols="auto">
              <b-button :variant="activeFilter === 'sizes' ? 'secondary' : 'outline-secondary'"
                @click="toggleFilter('sizes')">
                Filter by size
              </b-button>
            </b-col>
          </b-row>
          <!-- Sections des checkbox -->
          <!-- Pour les marques -->
          <b-row class="mt-2">
            <b-col v-if="activeFilter === 'brands'" cols="12">
              <b-card no-body>
                <b-form-group v-slot="{ ariaDescribedby }" class="px-3">
                  <b-form-checkbox-group id="checkbox-group-brands" v-model="selectedBrands" :options="brandOptions"
                    :aria-describedby="ariaDescribedby" name="brand-filter" @change="updateFilters"
                    class="my-3"></b-form-checkbox-group>
                  <span class="filter-text clickable-text" @click="selectAllBrands">Select All Brands</span>
                  <span class="filter-text clickable-text" @click="deselectAllBrands">Unselect All Brands</span>
                </b-form-group>
              </b-card>
            </b-col>
            <!-- Pour les couleurs -->
            <b-col v-if="activeFilter === 'colors'" cols="12">
              <b-card no-body>
                <b-form-group v-slot="{ ariaDescribedby }" class="px-3">
                  <b-form-checkbox-group id="checkbox-group-colors" v-model="selectedColors" :options="colorOptions"
                    :aria-describedby="ariaDescribedby" name="color-filter" @change="updateFilters"
                    class="my-3"></b-form-checkbox-group>
                  <span class="filter-text clickable-text" @click="selectAllColors">Select All Colors</span>
                  <span class="filter-text clickable-text" @click="deselectAllColors">Unselect All Colors</span>
                </b-form-group>
              </b-card>
            </b-col>
            <!-- Pour les tailles -->
            <b-col v-if="activeFilter === 'sizes'" cols="12">
              <b-card no-body>
                <b-form-group v-slot="{ ariaDescribedby }" class="px-3">
                  <b-form-checkbox-group id="checkbox-group-sizes" v-model="selectedSizes" :options="sizeOptions"
                    :aria-describedby="ariaDescribedby" name="size-filter" @change="updateFilters"
                    class="my-3"></b-form-checkbox-group>
                  <span class="filter-text clickable-text" @click="selectAllSizes">Select All Sizes</span>
                  <span class="filter-text clickable-text" @click="deselectAllSizes">Unselect All Sizes</span>
                </b-form-group>
              </b-card>
            </b-col>
            <!-- Tri par prix -->
            <b-col cols="12" class="mt-3">
              <b-form-group label="Sort by price:" v-slot="{ ariaDescribedby }">
                <b-form-select v-model="sortOrder" :options="sortOptions" :aria-describedby="ariaDescribedby"
                  name="price-sort" @input="updateFilters" class="custom-select-width"></b-form-select>
              </b-form-group>
            </b-col>
          </b-row>
        </b-col>
        <h4 class="mt-3">{{ this.totalProducts }} Products</h4>
        <div v-if="products.length === 0" class="no-products-message">
          No products found.
        </div>
        <!-- Affichage des produits -->
        <b-col v-for="product in products" :key="product.pro_id" cols="12" sm="6" md="4" lg="3">
          <router-link :to="`/${this.gender}/categories/${this.categoryId}/products/${product.pro_id}`" class="card-link">
            <b-card :img-src="getImageUrl(product.pro_image)" img-alt="Product Image" img-top
              class="mb-4 clickable-card transparent-card">
              <b-card-title class="b-card-title">{{ product.pro_name }} </b-card-title>
              <b-card-sub-title>
                {{ product.pro_currency }} {{ product.pro_price }}
              </b-card-sub-title>
            </b-card>
          </router-link>
        </b-col>
        <!-- Pagination -->
        <b-col cols="12">
          <b-pagination v-model="currentPage" :total-rows="totalProducts" :per-page="itemsPerPage"
            align="center"></b-pagination>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>


<script>
import axios from 'axios';

export default {
  name: 'ProductList',
  data() {
    return {
      products: [],
      brandOptions: [],
      colorOptions: [],
      sizeOptions: [],
      selectedBrands: [],
      selectedColors: [],
      selectedSizes: [],
      sortOptions: [
        { value: 'asc', text: 'Low to High' },
        { value: 'desc', text: 'High to Low' }
      ],
      sortOrder: 'asc',
      // Récupérés depuis les paramètres de l'URL
      categoryId: this.$route.params.categoryId,
      gender: this.$route.params.gender,
      currentPage: 1,
      itemsPerPage: 16,
      totalProducts: 0,
      activeFilter: null
    };
  },
  methods: {
    async fetchProducts() {
      try {
        // Récupère les paramètres de la requête
        const params = this.getQueryParams();
        // Appelle l'API pour récupérer les produits
        const response = await axios.get(`http://localhost:3000/tb/${this.gender}/categories/${this.categoryId}/products`, { params });
        this.products = response.data.products;
        this.totalProducts = response.data.total;
      } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
      }
    },

    getQueryParams() {
      const params = {};
      // Ajoute les filtres sélectionnés aux paramètres de la requête
      if (this.selectedBrands.length > 0) params['brand'] = this.selectedBrands;
      if (this.selectedColors.length > 0) params['color'] = this.selectedColors;
      if (this.selectedSizes.length > 0) params['size'] = this.selectedSizes;
      if (this.sortOrder) params['sort'] = this.sortOrder;
      // Ajoute les paramètres de pagination
      params['limit'] = this.itemsPerPage;
      params['offset'] = (this.currentPage - 1) * this.itemsPerPage;
      return params;
    },

    updateFilters() {
      this.currentPage = 1;
      // Attend que les filtres soient mis à jour avant de récupérer les produits
      this.$nextTick(() => {
        this.fetchProducts();
      });
    },

    async fetchBrandOptions() {
      try {
        // Récupère les marques disponibles pour la catégorie
        const response = await axios.get(`http://localhost:3000/tb/${this.gender}/categories/${this.categoryId}/brands`);
        this.brandOptions = response.data.map(brand => ({ text: brand.bra_name, value: brand.bra_name }));
      } catch (error) {
        console.error('Erreur lors de la récupération des marques:', error);
      }
    },

    async fetchColorOptions() {
      try {
        // Récupère les couleurs disponibles pour la catégorie
        const response = await axios.get(`http://localhost:3000/tb/${this.gender}/categories/${this.categoryId}/colors`);
        this.colorOptions = response.data.map(color => ({ text: color.col_name, value: color.col_name }));
      } catch (error) {
        console.error('Erreur lors de la récupération des couleurs:', error);
      }
    },

    async fetchSizeOptions() {
      try {
        // Récupère les tailles disponibles pour la catégorie
        const response = await axios.get(`http://localhost:3000/tb/${this.gender}/categories/${this.categoryId}/sizes`);
        this.sizeOptions = response.data.map(size => ({ text: size.siz_name, value: size.siz_name }));
      } catch (error) {
        console.error('Erreur lors de la récupération des tailles:', error);
      }
    },

    // Méthodes pour sélectionner/désélectionner toutes les options
    selectAllBrands() {
      this.selectedBrands = this.brandOptions.map(option => option.value);
      this.updateFilters();
    },
    deselectAllBrands() {
      this.selectedBrands = [];
      this.updateFilters();
    },
    selectAllColors() {
      this.selectedColors = this.colorOptions.map(option => option.value);
      this.updateFilters();
    },
    deselectAllColors() {
      this.selectedColors = [];
      this.updateFilters();
    },
    selectAllSizes() {
      this.selectedSizes = this.sizeOptions.map(option => option.value);
      this.updateFilters();
    },
    deselectAllSizes() {
      this.selectedSizes = [];
      this.updateFilters();
    },

    getImageUrl(imageBlob) {
      if (imageBlob) {
        // Transforme le blob en URL d'image
        const blob = new Blob([new Uint8Array(imageBlob.data)], { type: 'image/jpeg' });
        return URL.createObjectURL(blob);
      }
      return '';
    },

    // Méthode pour basculer entre les filtres actifs
    toggleFilter(filter) {
      this.activeFilter = this.activeFilter === filter ? null : filter;
    }
  },

  watch: {
    currentPage() {
      this.fetchProducts(); // Appelle fetchProducts lorsque currentPage change
    }
  },

  mounted() {
    this.fetchBrandOptions();
    this.fetchColorOptions();
    this.fetchSizeOptions();
    this.fetchProducts();
  }
};
</script>

<style scoped>
/* Style pour le texte cliquable */
.filter-text {
  color: #5d5b5b;
  cursor: pointer;
  margin-right: 1rem;
  font-size: 1rem;
  text-decoration: none;
}

.filter-text:hover {
  text-decoration: underline;
}

.custom-select-width {
  width: auto;
  min-width: 150px;
}

.card-link {
  text-decoration: none;
  color: inherit;
}

.clickable-card {
  transition: transform 0.2s ease-in-out;
}

.clickable-card:hover {
  cursor: pointer;
  transform: scale(1.01);
}

.transparent-card {
  background-color: transparent;
  border: none;
}

.b-card-title {
  font-size: 20px;
}
</style>
