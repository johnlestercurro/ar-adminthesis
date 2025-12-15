<script setup>
   import { ref } from 'vue';
   import { supabase } from '@/utils/supabase';
   import { requiredValidator, emailValidator } from '@/utils/validators';

   const email = ref('');
   const message = ref('');
   const error = ref('');

   const onSubmit = async () => {
     try {
       const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
         redirectTo: `${window.location.origin}/update-password`,
       });
       if (error) throw error;
       message.value = 'Password reset email sent! Check your inbox.';
       email.value = '';
     } catch (err) {
       error.value = err.message || 'Failed to send reset email.';
     }
   };
   </script>

   <template>
     <v-app>
       <v-container>
         <v-card max-width="400" class="mx-auto mt-10 pa-6">
           <v-card-title>Reset Password</v-card-title>
           <v-card-text>
             <v-text-field
               v-model="email"
               label="Email"
               :rules="[requiredValidator, emailValidator]"
               prepend-inner-icon="mdi-email"
               variant="outlined"
             />
             <v-btn color="blue" block @click="onSubmit">Send Reset Email</v-btn>
             <v-alert v-if="message" type="success" class="mt-4">{{ message }}</v-alert>
             <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
           </v-card-text>
         </v-card>
       </v-container>
     </v-app>
   </template>
