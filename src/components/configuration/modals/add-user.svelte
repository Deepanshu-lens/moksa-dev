<script lang="ts">
  //types
  type USER_DATA = {
    name: string;
    username: string;
    password: string;
    ip_addr: string;
    httpPort: string;
    ssl: boolean;
    session: string;
  };

  // Import
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Button } from "@/components/ui/button";
  import { toast } from "svelte-sonner";
  import * as Dialog from "../../../components/ui/dialog";
  import { Loader2, Send } from "lucide-svelte";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Checkbox from "@/components/ui/checkbox/checkbox.svelte";

// const BASE_URL = "https://license.lenscorp.cloud/test";
const BASE_URL = "https://license.lenscorp.cloud/api";


//todo find a better way to fetch the data after adding a user
const refreshPageWithUserSection = () => {
  window.location.href = window.location.pathname + "?section=User";
};

  //props
  export let parentId:string | undefined;
  export let featureBundles: any;
  // variables
  let dialogOpen: boolean = false;
  let userName: string = "";
  let userEmail: string = "";
  let userRole: { label: string, value: string } = { label: "", value: "" };
  let isLoading: boolean = false;
  let currentStep: number = 1;
  let newUserId: string | undefined;

  let expandedFeatureIndex: number | null = null;
  let selectedFeatures = new Set<number>();
  let selectedPermissions = new Set<number>();

  function nextStep() {
    if (currentStep < 2) {
      currentStep += 1;
    }
  }
  
  function previousStep() {
    if (currentStep > 1) {
      currentStep -= 1;
    }
  }

  // Functions
  async function handleSubmit() {
    try {
      // Use form data if addUserData is not provided
      if (!parentId) {
        throw new Error("Parent ID is required");
      }
      const userDataToSubmit = {
        name: userName,
        email: userEmail,
        roleName: userRole.value,
        parentId,
      };

      isLoading = true;
      const response = await fetch(`${BASE_URL}/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userDataToSubmit),
      });
      const result = await response.json();
      newUserId = result.id;
      if (!response.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`Invite sent successfully to ${userEmail}`);
      currentStep = 2;
    } catch (error) {
      console.error("Error sending invite:", error);
      toast.error("Failed to send invite");
    } finally {
      isLoading = false;
    }
  }

  function debounce<T extends (...args: any[]) => any>(
      fn: T,
      delay: number
  ): (...args: Parameters<T>) => void {
      let timeoutId: ReturnType<typeof setTimeout>;
      return (...args: Parameters<T>) => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => fn(...args), delay);
      };
  }
  
  let isEmailValid = true;
  const validateEmail = debounce((email: string) => {
      isEmailValid = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, 1000); // 1000ms delay

  // Watch userEmail changes
  $: if (userEmail !== undefined) validateEmail(userEmail);

  function toggleFeature(featureId: number, isChecked: boolean| string) {
    const feature = featureBundles.find((f: any) => f.featureId === featureId);
    if (!feature) {
      console.error(`Feature with ID ${featureId} not found.`);
      return;
    }

    if (isChecked) {
      selectedFeatures.add(featureId);
      feature.featurePermissions.forEach((permission: any) => {
        selectedPermissions.add(permission.permissionId);
      });
    } else {
      selectedFeatures.delete(featureId);
      feature.featurePermissions.forEach((permission: any) => {
        selectedPermissions.delete(permission.permissionId);
      });
    }
  }

  function togglePermission(permissionId: number, isChecked: boolean|string) {
    if (isChecked) {
      selectedPermissions.add(permissionId);
    } else {
      selectedPermissions.delete(permissionId);
    }
  }

  async function assignPermissions() {
    isLoading = true;
    try {
      const payload = {
        userId: newUserId,
        featureIds: Array.from(selectedFeatures),
        featurePermissionIds: Array.from(selectedPermissions),
      };

      const response = await fetch(`${BASE_URL}/user/features-permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error);
        return;
      }

      console.log("Payload:", payload);

      toast.success(`Permissions assigned successfully to ${userName}`);
      setTimeout(() => {
        refreshPageWithUserSection();
      }, 3000);
    } catch (error) {
      console.error("Error assigning permissions:", error);
      toast.error("Failed to assign permissions");
    } finally {
      dialogOpen = false;
      isLoading = false;
    }
  }
</script>

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content class="max-h-[550px]">
    <Dialog.Header>
      <Dialog.Title>
        {#if currentStep === 1}
          Add New User
        {:else}
          Assign Permissions
        {/if}
      </Dialog.Title>
    </Dialog.Header>

    {#if currentStep === 1}
      <!-- Step 1: User Details -->
      <div class="grid grid-cols-2 gap-4 py-4">
        <div class="col-span-2 flex items-center gap-4">
          <Label class="w-24" for="name">Name</Label>
          <Input
            type="text"
            bind:value={userName}
            class="text-base"
            placeholder="Name"
          />
        </div>
        <div class="col-span-2 flex items-center gap-4">
          <Label class="w-24" for="user-email">Email</Label>
          <Input
            type="email"
            bind:value={userEmail}
            class={cn("text-base", { error: !isEmailValid })}
            placeholder="Email"
          />
        </div>
        {#if !isEmailValid}
          <div class="col-span-2 text-red-500 text-sm">
            Please enter a valid email address.
          </div>
        {/if}
        <div class="col-span-2 flex items-center gap-4">
          <Label class="w-24" for="user-role">Role</Label>
          <Select bind:selected={userRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="superAdmin">Super Admin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    {/if}

    {#if currentStep === 2}
      <!-- Step 2: Feature assigning -->
      <div class="w-full h-full max-h-[300px] overflow-y-auto">
        {#each featureBundles as feature, index}
          <div class="border rounded-lg mb-2">
            <div class="flex justify-between items-center p-4 cursor-pointer">
              <div class="flex items-center gap-2">
                <Checkbox
                  class="rounded-full"
                  checked={selectedFeatures.has(feature.featureId)}
                  onCheckedChange={(e) => toggleFeature(feature.featureId, e)}
                />
                <span>{feature.feature}</span>
              </div>
              {#if feature.featurePermissions.length > 0}
                <button class="text-sm text-blue-500" on:click={() => expandedFeatureIndex = expandedFeatureIndex === index ? null : index}>
                  {expandedFeatureIndex === index ? 'Collapse' : 'Custom Configuration'}
                </button>
              {/if}
            </div>
            {#if expandedFeatureIndex === index}
              <div class="p-4 border-t">
                <ul class="flex justify-evenly items-start flex-wrap gap-4">
                  {#each feature.featurePermissions as permission}
                    <li class="flex items-center gap-2">
                      <Checkbox
                        class="rounded-full"
                        checked={selectedPermissions.has(permission.permissionId)}
                        onCheckedChange={(e) => togglePermission(permission.permissionId, e)}
                      />
                      <span>{permission.permission}</span>
                    </li>
                  {/each}
                </ul>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    <!-- Step Indicator -->
    <div class="flex justify-center mt-4">
      <div class="flex space-x-2">
        <div class={cn("size-1.5 rounded-full bg-gray-300", currentStep === 1 && "bg-blue-300")}></div>
        <div class={cn("size-1.5 rounded-full bg-gray-300", currentStep === 2 && "bg-blue-300")}></div>
      </div>
    </div>

    <Dialog.Footer>
      <span class="flex items-center gap-4">
        {#if currentStep === 1}
          <Button
            on:click={() => {
              dialogOpen = false;
            }}
            variant="secondary">Cancel</Button>
          <Button
            on:click={handleSubmit}
            disabled={!isEmailValid || !userEmail || isLoading}
            class="flex items-center gap-1 w-full"
          >
            {#if isLoading}
              <Loader2 size={16} class="animate-spin"/>
              <span>Sending Invite...</span>
            {:else}
              <Send size={16} />
              Invite User
            {/if}
          </Button>
        {/if}

        {#if currentStep === 2}
          <Button
            on:click={previousStep}
            variant="secondary">Back</Button>
          <Button
            on:click={() => {
              assignPermissions();
            }}
            disabled={isLoading}
            class="flex items-center gap-1 w-full"
          >
            {#if isLoading}
              <Loader2 size={16} class="animate-spin"/>
              <span>Assigning...</span>
            {:else}
              Assign Permissions
            {/if}
          </Button>
        {/if}
      </span>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>