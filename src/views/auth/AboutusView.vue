<template>
  <v-container class="about-container">
    <!-- ✅ Header Banner -->
    <v-sheet class="header-banner d-flex flex-column align-center justify-center text-center">
      <v-avatar size="100" color="white" class="mb-3">
        <v-icon size="60" color="primary">mdi-information-outline</v-icon>
      </v-avatar>
      <h1 class="text-white font-weight-bold">About Our Project</h1>
      <p class="text-white text-subtitle-1">Learn more about our system, team, and purpose.</p>
    </v-sheet>

    <!-- ✅ Project Overview -->
    <v-card class="mb-5 pa-4 elevation-3">
      <v-card-title class="text-h5 text-primary font-weight-bold">📌 Project Overview</v-card-title>
      <v-divider></v-divider>
      <v-card-text class="text-grey-darken-3">
        <p>
          <strong>Project Title:</strong> <br>
          <span class="text-blue-darken-3 font-weight-medium">
            Augmented Reality Navigation System for Newcomers in the
            College of Computing and Information Sciences Building at Caraga State University-Main Campus.
          </span>
        </p>
        <p class="mt-2">
          Our system is designed to help students and visitors easily navigate the CCIS building using an
          <strong>Augmented Reality (AR) interface</strong>. It provides a seamless experience by integrating
          interactive 3D mapping and real-time navigation features.
        </p>
      </v-card-text>
    </v-card>

    <!-- ✅ Meet the Team -->
    <v-card class="mb-5 pa-4 elevation-3">
      <v-card-title class="text-h5 text-primary font-weight-bold">👥 Meet the Team</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-row justify="center">
          <v-col v-for="(member, index) in teamMembers" :key="index" cols="12" md="4">
            <v-card class="pa-3 team-card elevation-2">
              <v-avatar size="90" color="blue-grey darken-3" class="mx-auto mb-3">
                <v-icon size="50" color="white">mdi-account</v-icon>
              </v-avatar>
              <v-card-title class="text-center text-blue-darken-4">{{ member.name }}</v-card-title>
              <v-card-subtitle class="text-center">{{ member.role }}</v-card-subtitle>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- ✅ System Features -->
    <v-card class="mb-5 pa-4 elevation-3">
      <v-card-title class="text-h5 text-primary font-weight-bold">🚀 System Features</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-list>
          <v-list-item v-for="(feature, index) in systemFeatures" :key="index">
            <v-list-item-icon>
              <v-icon color="green">mdi-check-circle</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <span class="text-grey-darken-3 font-weight-medium">{{ feature }}</span>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- ✅ Contact Information -->
    <v-card class="mb-5 pa-4 elevation-3">
      <v-card-title class="text-h5 text-primary font-weight-bold">📞 Contact Information</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <p><strong>Email:</strong> <span class="text-blue-darken-3">johnlestercurro@gmail.com</span></p>
        <p><strong>Phone:</strong> <span class="text-blue-darken-3">+63 951 198 7420</span></p>
        <p><strong>Location:</strong> <span class="text-blue-darken-3">Caraga State University, Butuan City, Philippines</span></p>
      </v-card-text>
    </v-card>

    <!-- ✅ Acknowledgments -->
    <v-card class="pa-4 elevation-3">
      <v-card-title class="text-h5 text-primary font-weight-bold">🙏 Acknowledgments</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <p>
          We extend our deepest gratitude to our thesis adviser, faculty members, and everyone
          who has provided guidance and support throughout this project.
        </p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';

// Team members
const teamMembers = ref([
  { name: 'John Lester Curro', role: 'Web Developer/Documentation' },
  { name: 'Christian Irag', role: 'AR Developer/Mobile App Developer' },
  { name: 'Christian Ruiz', role: 'Database Specialist' },
]);

// System Features
const systemFeatures = ref([
  'Augmented Reality-based navigation',
  'Interactive 3D building map',
  'User-friendly admin dashboard',
  'Real-time updates and notifications',
  'Secure authentication system',
]);
</script>

<style scoped>
/* ✅ Header Banner */
.header-banner {
  background: linear-gradient(135deg, #1E3A8A, #2563EB);
  height: 250px;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
}

/* ✅ About Container */
.about-container {
  max-width: 1100px;
  margin: auto;
}

/* ✅ Team Card */
.team-card {
  text-align: center;
  transition: transform 0.2s ease-in-out;
  border-radius: 12px;
}

.team-card:hover {
  transform: translateY(-5px);
}

/* ✅ List Items */
.v-list-item {
  transition: background 0.2s ease-in-out;
}

.v-list-item:hover {
  background: rgba(0, 0, 255, 0.05);
}
</style>
