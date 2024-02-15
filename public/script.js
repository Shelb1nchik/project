const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");
myVideo.muted = true;

backBtn.addEventListener("click", () => {
  document.querySelector(".main__left").style.display = "flex";
  document.querySelector(".main__left").style.flex = "1";
  document.querySelector(".main__right").style.display = "none";
  document.querySelector(".header__back").style.display = "none";
});

showChat.addEventListener("click", () => {
  document.querySelector(".main__right").style.display = "flex";
  document.querySelector(".main__right").style.flex = "1";
  document.querySelector(".main__left").style.display = "none";
  document.querySelector(".header__back").style.display = "block";
});

const user = prompt("Enter your name");

var peer = new Peer({
  host: '127.0.0.1',
  port: 3030,
  path: '/peerjs',
  config: {
    'iceServers': [
      { url: 'stun:stun01.sipphone.com' },
      { url: 'stun:stun.ekiga.net' },
      { url: 'stun:stunserver.org' },
      { url: 'stun:stun.softjoys.com' },
      { url: 'stun:stun.voiparound.com' },
      { url: 'stun:stun.voipbuster.com' },
      { url: 'stun:stun.voipstunt.com' },
      { url: 'stun:stun.voxgratia.org' },
      { url: 'stun:stun.xten.com' },
      {
        url: 'turn:192.158.29.39:3478?transport=udp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
      },
      {
        url: 'turn:192.158.29.39:3478?transport=tcp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
      }
    ]
  },

  debug: 3
});

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      console.log('someone call me');
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

const startScreenShareButton = document.getElementById("startScreenShareButton");

startScreenShareButton.addEventListener("click", () => {
  navigator.mediaDevices
    .getDisplayMedia({
      video: true,
    })
    .then((screenStream) => {
      myVideoStream = screenStream;
      addVideoStream(myVideo, screenStream);
    })
    .catch((error) => {
      console.error("Error starting screen share:", error);
    });

    socket.on("user-connected", (userId) => {
        connectToNewUser(userId, screenStream);
    });
});

const connectToNewUser = (userId, stream) => {
  console.log('I call someone' + userId);
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

peer.on("open", (id) => {
  console.log('my id is' + id);
  socket.emit("join-room", ROOM_ID, id, user);
});

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    videoGrid.append(video);
  });
};

let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

send.addEventListener("click", (e) => {
  if (text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
muteButton.addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  }
});

stopVideo.addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  }
});

document.addEventListener('DOMContentLoaded', () => {
    const createInteractiveButton = document.getElementById('createInteractive');
    const overlay = document.getElementById('overlay'); 
    const closeModalButton = document.getElementById('closeModal');
    const createSurveyButton = document.getElementById('createSurvey');
    const surveyModal = document.getElementById('surveyModal');
    const closeSurveyModalButton = document.getElementById('closeSurveyModal');
    const startSurveyButton = document.getElementById('startSurvey');
    const surveyQuestionInput = document.getElementById('surveyQuestion');
    const predefinedAnswers = document.querySelectorAll('.predefined-answers p');

    createInteractiveButton.addEventListener('click', () => {
        overlay.style.display = 'flex';
        
    });

    closeModalButton.addEventListener('click', () => {
        overlay.style.display = 'none';
    });

    createSurveyButton.addEventListener('click', () => {
        surveyModal.style.display = 'flex';
        surveyQuestionInput.value = '';
    });

    closeSurveyModalButton.addEventListener('click', () => {
        surveyModal.style.display = 'none';
        overlay.style.display = 'none';
    });

    startSurveyButton.addEventListener('click', () => {
        const question = surveyQuestionInput.value;

        if (!question) {
            alert('Enter a question before starting the survey.');
            return;
        }

        const options = Array.from(predefinedAnswers).map(answer => answer.textContent.trim());

        const surveyData = {
            question,
            options
        };
        console.log(surveyData);

        socket.emit("startSurvey", surveyData);

        overlay.style.display = 'none';
        surveyModal.style.display = 'none';
    });

});

document.addEventListener('DOMContentLoaded', () => {
    const createQuizButton = document.getElementById('createQuiz');
    const quizModal = document.getElementById('quizModal');
    const closeQuizModalButton = document.getElementById('closeQuizModal');
    const quizQuestionInput = document.getElementById('quizQuestion');
    const quizOptionsContainer = document.getElementById('quizOptions');
    const addOptionButton = document.getElementById('addOption');
    const startQuizButton = document.getElementById('startQuiz');

    createQuizButton.addEventListener('click', () => {
        quizModal.style.display = 'flex';
        quizOptions.innerHTML = '';
        quizQuestionInput.value = '';
    });

    closeQuizModalButton.addEventListener('click', () => {
        quizModal.style.display = 'none';
        overlay.style.display = 'none';
    });

    addOptionButton.addEventListener('click', () => {
        if (quizOptionsContainer.children.length < 4) {
            const newOption = document.createElement('div');
            newOption.classList.add('quiz-option');

            const optionInput = document.createElement('input');
            optionInput.type = 'text';
            optionInput.classList.add('option-text');
            optionInput.placeholder = 'Enter option';

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-option');
            deleteButton.innerHTML = '&times;';

            deleteButton.addEventListener('click', () => {
                newOption.remove();
            });

            newOption.appendChild(optionInput);
            newOption.appendChild(deleteButton);
            quizOptionsContainer.appendChild(newOption);
        } else {
            alert('You can add up to 4 options');
        }
    });

    startQuizButton.addEventListener('click', () => {
        const quizQuestionInput = document.getElementById('quizQuestion');
        const quizOptions = document.querySelectorAll('.quiz-option');

        if (!quizQuestionInput.value || quizOptions.length < 2) {
            const quizError = document.getElementById('quizError');
            quizError.textContent = 'Correctly fill in quiz information.';
            return;
        }

        const quizError = document.getElementById('quizError');
        quizError.textContent = '';

        overlay.style.display = 'none';
        quizModal.style.display = 'none';
    });
});


inviteButton.addEventListener("click", (e) => {
    prompt(
        "Copy this link and send it to people you want to meet with",
        window.location.href
    );
});

socket.on("receiveSurvey", (surveyData) => {
  // ���������, �� �������� �� ������� ������������ ������������ ������
  if (surveyData.senderUserId !== socket.id) {
    // ���������� ��������� ���� ������
      surveyModal.style.display = 'flex';
      surveyQuestion.innerHTML = surveyData[0];
      surveyData.options.forEach(option => {
          const answerOption = document.createElement('p');
          answerOption.textContent = option;
          predefinedAnswers.appendChild(answerOption);
      });
  }
});

socket.on("createMessage", (message, userName) => {
  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
        <b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName
    }</span> </b>
        <span>${message}</span>
    </div>`;
});