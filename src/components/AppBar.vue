<template>
  <div>
    <b-navbar type="dark" variant="secondary">
      <b-container fluid>
        <b-navbar-nav>
          <b-nav-item>
            <router-link to="/" class="nav-link-custom">HOME</router-link>
          </b-nav-item>
          <b-nav-item-dropdown text="Women" left no-caret>
            <div class="dropdown-menu-custom">
              <b-dropdown-item v-for="category in womenCategories" :key="category.id">
                <router-link :to="`/women/categories/${category.cat_id}/products`">
                  {{ category.cat_name }}
                </router-link>
              </b-dropdown-item>
            </div>
          </b-nav-item-dropdown>
          <b-nav-item-dropdown text="Men" left no-caret>
            <div class="dropdown-menu-custom">
              <b-dropdown-item v-for="category in menCategories" :key="category.id">
                <router-link :to="`/men/categories/${category.cat_id}/products`">
                  {{ category.cat_name }}
                </router-link>
              </b-dropdown-item>
            </div>
          </b-nav-item-dropdown>
          <b-nav-item class="logo ml-auto">
            <img src="@/assets/cart-icon.png" alt="Cart" class="logo-img mx-1" />
            <img src="@/assets/user-icon.png" alt="User" class="logo-img mx-1" />
          </b-nav-item>
        </b-navbar-nav>
      </b-container>
    </b-navbar>
  </div>
</template>


<script>
import axios from 'axios';

export default {
  name: 'AppBar',
  data() {
    return {
      womenCategories: [],
      menCategories: [],
    };
  },
  methods: {
    async fetchCategories(gender) {
      try {
        const response = await axios.get(`http://localhost:3000/tb/${gender}/categories`);
        if (gender === 'women') {
          this.womenCategories = response.data;
        } else if (gender === 'men') {
          this.menCategories = response.data;
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
      }
    },
  },
  mounted() {
    this.fetchCategories('women');
    this.fetchCategories('men');
  },
};
</script>


<style scoped>
.nav-link-custom {
  color: #ffffff !important;
  text-decoration: none;
}

.nav-link-custom:hover {
  color: #cccccc !important;
}

.logo {
  margin-left: auto;
}

.logo-img {
  width: 28px;
  height: 28px;
}

/* Menu déroulant avec CSS Grid */
.dropdown-menu-custom {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 10px;
  min-width: 300px;
  width: auto;
}

.dropdown-menu-custom .b-dropdown-item {
  padding: 5px;
  text-align: center;
}

.b-dropdown-menu {
  width: auto;
  min-width: 300px;
}
</style>
