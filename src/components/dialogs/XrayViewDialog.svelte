<!-- <script lang="ts">
    import * as Dialog from "@/components/ui/dialog/index.js";
    export let name:string;
    export let url:string;
    export let isXrayDialogOpen;
    let dialogOpen:boolean = false;

    $: {
    if(dialogOpen) {
        isXrayDialogOpen.set(true)
    } else {
        isXrayDialogOpen.set(false)

    }
  }
   </script>
    
   <Dialog.Root bind:open={dialogOpen}>
    <Dialog.Trigger 
     ><slot/></Dialog.Trigger
    >
    <Dialog.Content class="sm:max-w-[425px]">
     <Dialog.Header>
      <Dialog.Title>X-ray View for camera {name}</Dialog.Title>
     </Dialog.Header>
     <div class="grid gap-4 py-4">
      
     </div>
    </Dialog.Content>
   </Dialog.Root>


 -->

 <script lang="ts">
     import { onDestroy, onMount } from 'svelte';
    import * as Dialog from "@/components/ui/dialog/index.js";
    import Spinner from '../ui/spinner/Spinner.svelte';
    export let name: string;
    export let url: string;
    export let isXrayDialogOpen;
    let dialogOpen: boolean = false;
    let canvasElement: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;
    let connectionStatus: string = 'Disconnected';
    let loading: boolean = true
    let socket: WebSocket;

    $: {
        if (dialogOpen) {
            isXrayDialogOpen.set(true);
        } else {
            isXrayDialogOpen.set(false);
        }
    }

    async function connectWebSocket() {
        console.log('rtsp_url',url)
         socket = new WebSocket('ws://18.218.162.33:8989');

        
        socket.onopen = () => {
            console.log('WebSocket connected');
            connectionStatus = 'Connected';
            socket.send(url);
        };

        socket.onmessage = (event) => {
            loading = false
            const data = JSON.parse(event.data);
            const frameData = data.FrameData;
            displayFrame(frameData);
        };

        socket.onclose = () => {
            console.log('WebSocket disconnected');
            connectionStatus = 'Disconnected';
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            connectionStatus = 'Error';
        };
    }

    function displayFrame(base64Data: string) {
        const image = new Image();
        image.onload = () => {
            context.drawImage(image, 0, 0, canvasElement.width, canvasElement.height);
        };
        image.src = `data:image/jpeg;base64,${base64Data}`;
    }

    // onMount(() => {
    //     setTimeout(() => {
    //         console.log('dialogopen')
    //         if (canvasElement) {
    //             console.log('canvas found')
    //             context = canvasElement.getContext('2d');
    //         }
    //         if (dialogOpen) {
    //             console.log('called socket')
    //             connectWebSocket();
    //         }
    //     }, 3000);
    // });

    onDestroy(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            console.log('Closing WebSocket connection');
            socket.close();
        }
    });
</script>

<Dialog.Root bind:open={dialogOpen}>
    <Dialog.Trigger><slot /></Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[800px]">
        <Dialog.Header>
            <Dialog.Title>X-ray View for camera: {name}</Dialog.Title>
        </Dialog.Header>
        <div class="grid gap-4 py-4 place-items-center">
                <p>Connection status: {connectionStatus}</p>
                {#if loading}
                    <Spinner/>
{/if}
                <canvas bind:this={canvasElement} width="640" height="480"></canvas>
            </div>
    </Dialog.Content>
</Dialog.Root>
