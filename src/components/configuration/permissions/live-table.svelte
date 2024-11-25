<script lang="ts">
    import Button from "@/components/ui/button/button.svelte";
    import Checkbox from "@/components/ui/checkbox/checkbox.svelte";
    import * as Table from "@/components/ui/table/index";
  import { Check, Loader2 } from "lucide-svelte";
  import { computePaneFlexBoxStyle } from "node_modules/paneforge/dist/internal/utils";
  import { onMount } from "svelte";
    import { toast } from "svelte-sonner";

    interface Permission {
        collectionId: string;
        collectionName: string;
        created: string;
        feature: string;
        id: string;
        permission: string;
        updated: string;
    }

    interface Role {
        collectionId: string;
        collectionName: string;
        created: string;
        id: string;
        email:string;
        name: string;
        updated: string;
        users: any[];
    }

    interface License {
        bundles: any[];
        collectionId: string;
        collectionName: string;
        created: string;
        expiry: string;
        features: string[];
        id: string;
        updated: string;
        user: string;
    }

    interface User {
        name: string;
        id: string;
        email: string;
        parentId: string;
        role: Role;
        license: License[];
        permissions: Permission[];
    }

    interface Feature {
        id: string;
        featureId: string;
        name: string;
    }

    interface ApiResponse {
        success: boolean;
        error?: string;
        message?: string;
    }

    export let permissions;
    export let fetchSubUsers;
    export let featureId;
    let subUsers:any[] = [];

    export let assignPermissions: (userId: string, featureId: string, permissions: string[]) => Promise<ApiResponse>;
        
    // Add state management for checkboxes with proper typing
    let userPermissions: Record<string, Set<string>> = {};
    let initialUserPermissions: Record<string, Set<string>> = {};

    $: {
        if (subUsers.length > 0) {
            subUsers.forEach(user => {
                if (!userPermissions[user.id]) {
                    const permissionsSet = new Set<string>(user.permissions?.map(p => p.id) || []);
                    userPermissions[user.id] = permissionsSet;
                    initialUserPermissions[user.id] = new Set<string>(permissionsSet); 
                }
            });
        }
    }

    function handlePermissionChange(userId: string, permissionId: string, checked: boolean) {
        if (!userPermissions[userId]) {
            userPermissions[userId] = new Set();
        }
        
        if (checked) {
            userPermissions[userId].add(permissionId);
        } else {
            userPermissions[userId].delete(permissionId);
        }
    }

    let isLoading = false;

    async function handleSavePermissions() {
        isLoading = true; // Set loading state to true
        try {
            const promises = Object.entries(userPermissions).map(([userId, permissionsSet]) => {
                const initialPermissionsSet = initialUserPermissions[userId] || new Set();
                if (permissionsSet.size !== initialPermissionsSet.size || [...permissionsSet].some(p => !initialPermissionsSet.has(p))) {
                    const permissionsArray = Array.from(permissionsSet);
                    return assignPermissions(userId, featureId, permissionsArray);
                }
                return Promise.resolve({ success: true }); // No changes, no API call
            });

            const results = await Promise.all(promises);

            results.forEach((result, index) => {
                if (!result.success) {
                    console.error(`Error assigning permissions for user ${Object.keys(userPermissions)[index]}: ${result.error}`);
                }
            });

            toast.success("Permissions assigned successfully");
        } catch (error) {
            console.error("Error in assigning permissions:", error);
            toast.error("Failed to assign permissions");
        } finally {
            isLoading = false; // Reset loading state
        }
    }

    $: fetchSubUsers(featureId).then((data:any) => subUsers = data)
</script>

<Table.Root class="mt-5 p-3 lg:mx-auto h-full lg:w-full w-[90vw] flex flex-col lg:max-w-[calc(100vw-8.3rem)] max-h-[calc(100vh-360px)] overflow-auto lg:pb-0 pb-[25vh]">
    <Table.Header class="border rounded-lg w-max min-w-full">
        <Table.Row class="flex items-center p-3 gap-4">
            <!-- <Table.Head class="w-[30px]">
                <Checkbox/>
            </Table.Head> -->
            <Table.Head class="w-[130px]">User Info</Table.Head>
            {#if permissions.length === 0}
                <Table.Head class="lg:mx-auto">
                    No features to assign
                </Table.Head>
            {:else}
                {#each permissions as permission}
                    <Table.Head class="w-[130px]">
                        {permission.permission}
                    </Table.Head>
                {/each}
            {/if}
        </Table.Row>
    </Table.Header>
    <Table.Body class="lg:pb-10 pb-3">
        {#if subUsers.length === 0}
            <Table.Row class="flex items-center gap-4 mt-2 px-3 rounded-lg border w-max min-w-full">
                <Table.Cell class="w-full text-left">
                    No users have been assigned to this feature
                </Table.Cell>
            </Table.Row>
        {:else}
            {#each subUsers as user}
                <Table.Row class="flex items-center gap-4 mt-2 px-3 rounded-lg border w-max min-w-full">
                    <Table.Cell class="lg:w-[130px] w-full">
                        <span class="flex flex-col">
                            <span>Name: {user.name}</span>
                            <span class="text-xs">Email: {user.email}</span>
                        </span>
                    </Table.Cell>
                    {#each permissions as permission}
                        <Table.Cell class="lg:w-[130px] w-full">
                            <Checkbox class="rounded-full" checked={user.permissions.some((userPermission: any) => userPermission.id === permission.id)} onCheckedChange={(v)=>handlePermissionChange(user.id, permission.id, v)}/>
                        </Table.Cell>
                    {/each}
                </Table.Row>
            {/each}
        {/if}
    </Table.Body>
    {#if subUsers.length > 0 && permissions.length > 0}
    <Table.Footer class="flex justify-end items-center bg-transparent">  
        <Button on:click={handleSavePermissions} disabled={isLoading}>
            {#if isLoading}
            <Loader2 class="animate-spin"/>   
            Saving...
            {:else}
            Save
            {/if}
            </Button>
            </Table.Footer>
    {/if}
</Table.Root>
