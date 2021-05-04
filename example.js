window.Room = require('./src');
require('./livestreaming');


var room;
// var server = 'ws://192.168.2.32:8188/janus';
var server = 'wss://demo-call.panelist.com:8188/janus'
var roomId = 1234; // Demo room
var username = 'user' + (new Date()).valueOf()
// var username  = 'ciao'
var publishOwnFeed = false;
if (!username) {
  return alert('Username is needed. Please refresh');
}
publishOwnFeed = window.confirm("Publish own feed?")
alert(publishOwnFeed)
document.getElementById('username').innerHTML = username;

// Event handlers
var onError = function (err) {
  if (err.indexOf('The room is unavailable') > -1) {
    alert('Room ' + roomId + ' is unavailable. Let\'s create one.');
    room.createRoom({
      room: roomId

    })
      .then(() => {
        setTimeout(function () {
          room.register({
            username: username,
            room: roomId
          });
        }, 1000);
      })
      .catch((err) => {
        alert(err);
      })
  } else {
    alert(err);
  }
}

var onWarning = function (msg) {
  alert(msg);
}

var onVolumeMeterUpdate = function (streamIndex, volume) {
  let el = document.getElementById('volume-meter-0');
  el.style.width = volume + '%';
}

var onLocalJoin = function () {
  var htmlStr = '<div>' + username + '</div>';
  htmlStr += '<button id="local-toggle-mute-audio" onclick="localToggleMuteAudio()">Mute</button>';
  htmlStr += '<button id="local-toggle-mute-video" onclick="localToggleMuteVideo()">Pause webcam</button>';
  htmlStr += '<button id="local-toggle-video" onclick="localToggleVideo()">Toggle webcam</button>';
  htmlStr += '<video id="myvideo" style="width:inherit;" autoplay muted="muted"/>';
  document.getElementById('videolocal').innerHTML = htmlStr;
  let target = document.getElementById('myvideo');
  room.attachStream(target, 0);
}

var onRemoteJoin = function (index, remoteUsername, feedId) {
  document.getElementById('videoremote' + index).innerHTML = '<div>' + remoteUsername + ':' + feedId + '</div><video style="width:inherit;" id="remotevideo' + index + '" autoplay/>';
  let target = document.getElementById('remotevideo' + index);
  room.attachStream(target, index);

}

var onRemoteUnjoin = function (index) {
  document.getElementById('videoremote' + index).innerHTML = '<div>videoremote' + index + '</div>';
}

var onRecordedPlay = function () {
  var htmlStr = '<div>playback</div>';
  htmlStr += '<video id="playback" style="width:inherit;" autoplay muted="muted"/>';
  document.getElementById('videoplayback').innerHTML = htmlStr;
  let target = document.getElementById('playback');
  room.attachRecordedPlayStream(target);
}

var onMessage = function (data) {
  if (!data) {
    return;
  }
  if (data.type && data.type === 'chat') {
    document.getElementById("chatbox").innerHTML += '<p>' + data.sender + ' : ' + data.message + '</p><hr>';
  } else if (data.type && data.type === 'request') {
    if (data.action && data.action === 'muteAudio') {
    }
  }
}

var options = {
  server: server,
  room: roomId,
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAxZTZjN2QxLTk3YjUtNDc4Zi1hY2NhLTIxNjljMDc2YzA0NiIsImlhdCI6MTYxMDI0NzU4OCwiZXhwIjo0NzYzODQ3NTg4fQ.jA1YauZZFKYAtbonxau81BRFoU4GC23m5k3Ro0xs0Zc',
  extensionId: 'bkkjmbohcfkfemepmepailpamnppmjkk',
  publishOwnFeed: true,
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  useRecordPlugin: true,
  volumeMeterSkip: 10,
  onLocalJoin: onLocalJoin,
  onRemoteJoin: onRemoteJoin,
  onRemoteUnjoin: onRemoteUnjoin,
  onRecordedPlay: onRecordedPlay,
  onMessage: onMessage,
  onError: onError,
  onWarning: onWarning,
  onVolumeMeterUpdate: onVolumeMeterUpdate,
}

room = window.room = new window.Room(options);
room.init()
  .then(function () {
    setTimeout(function () {
      room.register({
        username: username,
        room: roomId
      });
    }, 1000);
  })
  .catch((err) => {
    alert(err);
  });

document.getElementById('sharescreen').onclick = function () {
  room.shareScreen()
    .then(() => {
    })
    .catch((err) => {
      alert(err);
    });
}

document.getElementById('stopsharescreen').onclick = function () {
  room.stopShareScreen()
    .then(() => {
    })
    .catch((err) => {
      alert(err);
    });
}

document.getElementById('stop').onclick = function () {
  room.removeRoom()
    .then(() => {
      setTimeout(() => {
        room.stop()
      }, 500);
    });
  alert('Successfuly quit. The page will be reloaded.');
  window.location.reload();
}

document.getElementById('register').onclick = function () {
  room.register({
    username: username
  });
}

document.getElementById('chatsend').onclick = function () {
  var message = document.getElementById('chatinput').value;
  room.sendMessage({
    type: 'chat',
    sender: username,
    message: message
  })
    .then(function (data) {
      document.getElementById("chatbox").innerHTML += '<p>' + username + ' : ' + message + '</p><hr>';
    });
}

document.getElementById('getrecordedlist').onclick = function () {
  room.getRecordedList()
    .then((result) => {
      console.log(result);
      if (result && result.list && result.list.length > 0) {
        let recordedListElement = document.getElementById('recordedlist');
        recordedListElement.innerHTML = '';
        for (let i in result.list) {
          recordedListElement.innerHTML += '<a href="#" onClick="recordedPlayback(' + result.list[i].id + ')">' + result.list[i].name + '</a><br>';


        }
      }
    })
    .catch((err) => {
      alert(err);
    });
}

document.getElementById('stoprecording').onclick = function () {
  room.stopRecording()
    .then(function () {
      alert('Recording is being stopped.')
    })
    .catch((err) => {
      alert(err);
    });
}

document.getElementById('startrecording').onclick = function () {
  let recordName = window.prompt('Record name : ');
  room.startRecording({
    name: recordName
  });
}

window.recordedPlayback = function (recordId) {
  room.recordedPlayback(recordId);
}

window.localToggleMuteAudio = function () {
  room.toggleMuteAudio()
    .then((muted) => {
      var el = document.getElementById('local-toggle-mute-audio');
      if (muted) {
        el.innerHTML = "Unmute";
      } else {
        el.innerHTML = "Mute";
      }
    });
}

window.localToggleMuteVideo = function () {
  room.toggleMuteVideo()
    .then((muted) => {
      var el = document.getElementById('local-toggle-mute-video');
      if (muted) {
        el.innerHTML = "Resume webcam";
      } else {
        el.innerHTML = "Pause webcam";
      }
    });
}

window.localToggleVideo = function () {
  room.toggleVideo()
    .then((stopped) => {
      console.log(stopped);
    });
}
