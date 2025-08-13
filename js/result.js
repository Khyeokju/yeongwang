firebase.initializeApp(window.__FIREBASE_CONFIG__);
const storage = firebase.storage();

function initCameraAndCapture() {
  const video = document.getElementById("webcam");
  const canvas = document.getElementById("snapshot");
  const img = document.getElementById("captured-image");
  const countdownEl = document.getElementById("countdown");

  navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    video.srcObject = stream;

    let timeLeft = 7;
    countdownEl.textContent = timeLeft; 
    const timer = setInterval(() => {
      timeLeft--;
      countdownEl.textContent = timeLeft;
      if (timeLeft === 0) {
        clearInterval(timer);

        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        const cropTop = videoHeight * 0.02;
        const cropHeight = videoHeight * 0.9;

        canvas.width = videoWidth;
        canvas.height = videoHeight;

        canvas.getContext("2d").drawImage(
          video,
          0, cropTop,
          videoWidth, cropHeight,
          0, 0,
          canvas.width, canvas.height
        );

        const dataUrl = canvas.toDataURL("image/png");

        stream.getTracks().forEach(track => track.stop());
        video.style.display = "none";
        img.src = dataUrl;
        img.style.display = "block";
        countdownEl.style.display = "none";

        console.log("캡처 완료 → 전체 프레임 업로드 시작");
        showQRLoading(); // 로딩 표시 함수 호출
        captureFullFrameAndUpload();
      }
    }, 2000);
  }).catch(err => {
    console.error("카메라 접근 실패:", err);
  });
}

function captureFullFrameAndUpload() {
  const area = document.getElementById("capture-area");
  const video = document.getElementById("webcam");

  video.remove();

  setTimeout(() => {
    html2canvas(area, {
      useCORS: true,
    }).then(canvas => {
      canvas.toBlob(blob => {
        if (!blob) {
          console.error("❌ Blob 생성 실패");
          return;
        }

        const fileName = `results/${Date.now()}.png`;
        const storageRef = storage.ref().child(fileName);

        console.log("Firebase Storage 업로드 시작...");

        storageRef.put(blob).then(snapshot => {
          console.log("업로드 완료:", snapshot);
          return snapshot.ref.getDownloadURL();
        }).then(downloadURL => {
          console.log("다운로드 URL:", downloadURL);

          const qr = new QRious({
            element: document.createElement("canvas"),
            value: downloadURL,
            size: 220
          });

          const qrContainer = document.getElementById("qrcode");
          removeQRLoading(); // 로딩 제거 함수 호출
          qrContainer.innerHTML = "";
          qrContainer.appendChild(qr.element);

          const text = document.createElement("div");
          text.id = "qr-text";
          text.innerText = "QR코드로 파일을 다운로드 하세요!";
          qrContainer.appendChild(text);
        }).catch(err => {
          console.error("Firebase 업로드 실패:", err);
        });
      });
    }).catch(err => {
      console.error("html2canvas 실패:", err);
    });
  }, 300);
}

function showQRLoading() {
  const qrContainer = document.getElementById("qrcode");
  qrContainer.innerHTML = `
    <img id="qr-loading" src="../images/loading.gif" alt="로딩 중..." />
    <div id="qr-text">QR코드를 생성 중입니다.</div>
  `;
}
// <a href="https://pixabay.com/ko//?utm_source=link-attribution&utm_medium=referral&utm_campaign=animation&utm_content=7166">Pixabay</a>에서 <a href="https://pixabay.com/ko/users/u_u9abgwxlgv-38338414/?utm_source=link-attribution&utm_medium=referral&utm_campaign=animation&utm_content=7166">u_u9abgwxlgv</a>님이 제공한 GIF

function removeQRLoading() {
  const loadingImg = document.getElementById("qr-loading");
  const text = document.getElementById("qr-text");
  if (loadingImg) loadingImg.remove();
  if (text) text.remove();
}

window.onload = initCameraAndCapture;
