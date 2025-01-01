<script>
  import * as Select from "@/components/ui/select";
  import Label from "@/components/ui/label/label.svelte";
  import { onMount } from "svelte";

  let notification_sounds = [
    "Level Up",
    "Notification",
    "Public Beep",
    "Short Beep",
  ];

  let audio;

  const handleSelectAlertSound = (v) => {
    window.localStorage.setItem("alertSound", v?.value);
    let sound = v?.value;
    let soundFilePath = "/level-up.mp3";
    if (sound === "Notification") {
      soundFilePath = "/notification-alert.mp3";
    } else if (sound === "Public Beep") {
      soundFilePath = "/public-beep-sound.mp3";
    } else if (sound === "Short Beep") {
      soundFilePath = "/short-beep-tone.mp3";
    } else {
      soundFilePath = "/level-up.mp3";
    }
    audio = new Audio(`/notification-sounds/${soundFilePath}`);
    audio.play();
  };
</script>

<div class="h-full p-5 pt-8">
  <div class="flex flex-col m-5">
    <Label class="">Select Event Alert Sounds</Label>
    <Select.Root portal={null} onSelectedChange={handleSelectAlertSound}>
      <Select.Trigger class="mt-3 w-52">
        <Select.Value placeholder="Select a Preset" />
      </Select.Trigger>
      <Select.Content class="">
        <Select.Group>
          <Select.Label class="">Presets</Select.Label>
          {#if notification_sounds.length > 0}
            {#each notification_sounds as sound}
              <Select.Item class="" value={sound} label={sound}
                >{sound}</Select.Item
              >
            {/each}
          {:else}
            <Select.Item class="" value={null} label={null}
              >No Presets</Select.Item
            >
          {/if}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  </div>
</div>
