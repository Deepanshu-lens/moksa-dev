<script lang="ts">
    import { Button } from "@/components/ui/button";
    import AddUser from "@/components/configuration/modals/add-user.svelte";
    import {
      Table,
      TableBody,
      TableCell,
      TableHead,
      TableHeader,
      TableRow,
    } from "@/components/ui/table";
    import { Checkbox } from "@/components/ui/checkbox";
    import {
      SlidersHorizontal,
      Plus,
      ArrowDown,
      SquarePen,
    } from "lucide-svelte";
    import { user } from '@/stores'
    export let userData: any;
    export let userChildrenData: any;
    const roles = {
        superAdmin: 'Super Admin',
        admin: 'Admin',
        user: 'User',
    };
    interface FeaturePermission {
      permission: string;
      permissionId: string;
    }

    interface FeatureBundle {
      feature: string;
      featureId: string;
      featurePermissions: FeaturePermission[];
    }

    let featureBundles: FeatureBundle[] = [];

    const BASE_URL = "https://license.lenscorp.cloud/api";

    const sanitizeUserPermissions = (data: any) => {
      featureBundles = data.features.map((feature: any) => ({
        feature: feature.features,
        featureId: feature.id,
        featurePermissions: data.permissions
          .filter((permission: any) => permission.feature === feature.id)
          .map((permission: any) => ({
            permission: permission.permission,
            permissionId: permission.id
          }))
      }));
    };

    const getUserPermissions = async () => {
      const response = await fetch(`${BASE_URL}/user/${$user?.id}/featuresPermission`);
      const result = await response.json();
      result && sanitizeUserPermissions(result);
    }

$: if($user) {
  getUserPermissions();
}
</script>

<div class="p-2 h-auto rounded-lg w-full">
  <div class="border border-gray-200 rounded-lg shadow-sm">
    <!-- Table Heading -->
    <div class="flex lg:flex-row flex-col justify-between lg:items-center mb-4 px-3 gap-2 pt-2 lg:px-5 lg:pt-4">
      <div>
        <div class="flex items-center gap-2 my-1">
          <h2 class="text-xl font-semibold">{userData?.name || 'User Name'}</h2>
          <span
            class="text-sm text-black/.5 bg-[#F7FAFF] rounded-lg px-2 py-1 text-[#0070FF]"
            >{roles[userData?.expand?.role?.name as keyof typeof roles] || 'User Role'}</span
          >
        </div>
        <p class="text-sm text-gray-500">Record of user & log events</p>
      </div>
      <div class="flex items-center space-x-2">
        <Button disabled variant="outline" class="flex items-center" size="sm">
          <SlidersHorizontal class="w-4 h-4 mr-2" />
          Filters
        </Button>
       
        {#if userData?.expand?.role?.name !== 'user'}
          <AddUser parentId={userData?.id} featureBundles={featureBundles}>
            <Button size="sm">
              <Plus class="w-4 h-4 mr-2" />
              Add User
            </Button>
          </AddUser>
        {/if}
      </div>
    </div>

    <!-- Fixed Table Header -->
    <Table class="w-full">
      <TableHeader class="bg-[#EAECF0]/50">
        <TableRow>
          <TableHead>
            <Checkbox />
          </TableHead>
          <TableHead class="w-[18%] -ml-6">
            <span class="flex items-center gap-1">User Name <ArrowDown size={15} /></span>
          </TableHead>
          <TableHead class="w-[13%]">
            <span class="flex items-center gap-1">Role <ArrowDown size={15} /></span>
          </TableHead>
          <TableHead class="w-[15%]"  >
            <span class="flex items-center gap-1">Email Address <ArrowDown size={15} /></span>
          </TableHead>
          <TableHead class="w-[15%]">
            <span class="flex items-center gap-1">Last Activity <ArrowDown size={15} /></span>
          </TableHead>
          <TableHead class="w-[15%]">
            <span class="flex items-center gap-1">Log Event <ArrowDown size={15} /></span>
          </TableHead>
          <TableHead class="w-[10%]">Action</TableHead>
        </TableRow>
      </TableHeader>
    </Table>

    <!-- Scrollable Table Body -->
    <div class="lg:max-h-[58vh] max-h-[30vh] overflow-y-auto">
      <Table class="w-full">
        <TableBody>
          {#if userChildrenData.length === 0}
          <TableRow>
            <TableCell colspan={7} class="text-center text-neutral-500">
              No users
            </TableCell>
          </TableRow>
          {:else}
            <!-- Reversed to get the latest user first -->
            {#each userChildrenData.reverse() as user}
              <TableRow>
                <TableCell class="w-5">
                  <Checkbox />
                </TableCell>
                <TableCell class="w-[15%]">{user.name}</TableCell>
                <TableCell class="w-[15%] text-neutral-500">
                  {roles[user?.role?.name as keyof typeof roles] || 'User Role'}
                </TableCell>
                <TableCell class="w-[15%] text-neutral-500">{user.email}</TableCell>
                <TableCell class="w-[15%] text-neutral-500">{user.lastActivity}</TableCell>
                <TableCell class="w-[15%] text-neutral-500">{user.logEvent}</TableCell>
                <TableCell class="w-[10%]">
                  <Button
                    size="sm"
                    variant="ghost"
                    class="bg-[#F16522]/10 rounded-3xl text-[#F16522] py-3 px-3"
                  >
                    <SquarePen class="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            {/each}
          {/if}
        </TableBody>
      </Table>
    </div>
  </div>
</div>