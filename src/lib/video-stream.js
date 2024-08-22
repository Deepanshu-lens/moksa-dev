import { VideoRTC } from "./video-rtc.js";

/**
 * This is example, how you can extend VideoRTC player for your app.
 * Also you can check this example: https://github.com/AlexxIT/WebRTC
 */
export class VideoStream extends VideoRTC {
  /**
   * Custom GUI
   */

  // async checkCodec() {
  //   const pc = new RTCPeerConnection(this.pcConfig);
  //   const offer = await pc.createOffer();
  //   const sdp = offer.sdp;
  //   console.log(sdp)
  //   pc.close();

  //   if (sdp.includes("H265") || sdp.includes("hvc1")) {
  //     return ["h265",sdp];
  //   } else {
  //     return ["h264",sdp,offer];
  //   }
  // }


  oninit() {
    console.debug("stream.oninit");
    super.oninit();
  }

  onconnect() {
    console.debug("stream.onconnect");
    const result = super.onconnect();
    // console.log(result)
    if (result) this.divMode = "loading";
    return result;
  }

  ondisconnect() {
    console.debug("stream.ondisconnect");
    super.ondisconnect();
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  onopen() {
    console.debug("stream.onopen");
    const result = super.onopen();
    // console.log(result)
    this.onmessage["stream"] = (msg) => {
      // console.log(msg)
      // console.log(msg.type)
      console.debug("stream.onmessge", msg);
      switch (msg.type) {
        case "error":
          this.divError = msg.value;
          break;
        case "mse":
        case "hls":
        case "mp4":
        case "mjpeg":
          this.divMode = msg.type.toUpperCase();
          break;
      }
    };

    return result;
  }

  onclose() {
    console.debug("stream.onclose");
    return super.onclose();
  }

  onpcvideo(ev) {
    console.debug("stream.onpcvideo");
    super.onpcvideo(ev);

    if (this.pcState !== WebSocket.CLOSED) {
      this.divMode = "RTC";
    }
  }
}

customElements.define("video-stream", VideoStream);
