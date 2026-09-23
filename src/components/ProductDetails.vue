<template>
  <div>
    <b-container class="p-3">
      <b-card class="custom-card-background no-border">
        <b-row no-gutters>
          <b-col md="6" class="d-flex align-items-center">
            <!-- Affichage de l'image du produit -->
            <b-card-img :src="getImageUrl(product.pro_image)" alt="Product Image"
              class="rounded-0 product-image"></b-card-img>
          </b-col>
          <b-col md="6">
            <!-- Affichage des détails du produit -->
            <b-card-body>
              <b-card-title>{{ product.pro_name }}</b-card-title>
              <b-card-sub-title>{{ product.pro_currency }} {{ product.pro_price }}</b-card-sub-title>
              <b-card-text>
                <br />
                <p><strong>Brand:</strong> {{ product.bra_name }}</p>
                <p><strong>Category:</strong> {{ product.cat_name }}</p>
                <p><strong>Gender:</strong> {{ product.pro_gender }}</p>
                <p><strong>Description:</strong> <span v-html="product.pro_description"></span></p>
                <p><strong>Color:</strong> {{ product.col_name }}</p>
                <br />
                <b-row class="mt-3">
                  <!-- Liste déroulante des tailles -->
                  <b-col>
                    <b-form-group class="mb-0">
                      <b-form-select v-model="selectedSize" :options="product.sizes"></b-form-select>
                    </b-form-group>
                  </b-col>
                  <!-- Bouton -->
                  <b-col>
                    <b-button variant="primary" class="w-100">
                      Add to Cart
                    </b-button>
                  </b-col>
                </b-row>
              </b-card-text>
            </b-card-body>
          </b-col>
        </b-row>
      </b-card>
    </b-container>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ProductDetails',
  data() {
    return {
      product: {},
      // Récupérés depuis les paramètres de l'URL
      categoryId: this.$route.params.categoryId,
      gender: this.$route.params.gender,
      productId: this.$route.params.productId,
      selectedSize: '',
    };
  },
  methods: {
    async fetchProductDetails() {
      try {
        // Récupérer les détails du produit depuis l'API
        const response = await axios.get(`http://localhost:3000/tb/${this.gender}/categories/${this.categoryId}/products/${this.productId}`);
        this.product = response.data;

        // Si des tailles sont disponibles, présélectionner la première
        if (this.product.sizes && this.product.sizes.length > 0) {
          this.selectedSize = this.product.sizes[0];
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des détails du produit:', error);
      }
    },
    getImageUrl(imageBlob) {
      if (imageBlob) {
        // Transformer le blob en URL d'image
        const blob = new Blob([new Uint8Array(imageBlob.data)], { type: 'image/jpeg' });
        return URL.createObjectURL(blob);
      }
      return '';
    },
  },
  mounted() {
    // Détails du produit récupérés au montage du composant
    this.fetchProductDetails();
  },
};
</script>

<style scoped>
.product-image {
  object-fit: contain;
  max-height: 500px;
}

.custom-card-background {
  background-color: #f0f0f0;
}

.no-border {
  border: none;
}
</style>