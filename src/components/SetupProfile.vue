<script setup lang="ts">
import { useFormSpaceSettings } from '@/composables/useFormSpaceSettings';

const emit = defineEmits(['next', 'back']);

const { form, showAllValidationErrors } = useFormSpaceSettings('setup');

function nextStep() {
  if (!form.value.name) return (showAllValidationErrors.value = true);
  emit('next');
}
</script>

<template>
  <div class="space-y-4">
    <SettingsProfileBlock context="setup" />

    <SettingsLinkBlock context="setup" />
  </div>
  <div class="px-4 md:px-0">
    <SetupButtonBack @click="emit('back')" />
    <SetupButtonNext @click="nextStep" />
  </div>
</template>
