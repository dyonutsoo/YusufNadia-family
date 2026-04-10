// main.js (make sure it's loaded as a module)

// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, get, child, push, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Your Firebase config (include databaseURL)
const firebaseConfig = {
  apiKey: "AIzaSyC2uOzQQS4ntYxKd5NVsZtwaiMxH_6xB7o",
  authDomain: "yusufnadia.firebaseapp.com",
  databaseURL: "https://yusufnadia-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "yusufnadia",
  storageBucket: "yusufnadia.firebasestorage.app",
  messagingSenderId: "442575993746",
  appId: "1:442575993746:web:7774e9a99141625ec25f4b",
  measurementId: "G-2Z5Z2XFVMZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Ensure user is signed in anonymously before anything
let userUID = null;

signInAnonymously(auth)
  .then(() => {
    console.log("Signed in anonymously.");
  })
  .catch((error) => {
    console.error("Anonymous sign-in failed:", error);
  });

onAuthStateChanged(auth, (user) => {
  if (user) {
    userUID = user.uid;
    console.log("User UID:", userUID);
  }
});

// Test Firebase connection (Realtime DB style)
const rsvpRef = ref(db, "rsvp"); // points to /rsvp
const newRsvpRef = push(rsvpRef); // generates a new unique child node

set(newRsvpRef, {
  name: "Testing User",
  timestamp: Date.now()
})
.then(() => {
  console.log("✅ RSVP test added:", newRsvpRef.key); // `.key` is the ID
})
.catch(console.error);


function startAutoScroll() {
  const targetDuration = 15; // seconds
  const totalDistance = document.body.scrollHeight - window.innerHeight;
  let speed = totalDistance / (targetDuration * 60); // 60fps assumption
  const maxSpeed = speed * 0.2;
  const acceleration = speed / 30;
  let scrollOffset = 0;

  function scrollStep() {
    if (!autoScrollActive) return;

    const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight;
    if (atBottom) return;

    scrollOffset += speed;
    const scrollPixels = Math.floor(scrollOffset);
    scrollOffset -= scrollPixels;

    if (scrollPixels > 0) {
      window.scrollBy(0, scrollPixels);
    }

    speed = Math.min(speed + acceleration, maxSpeed);
    requestAnimationFrame(scrollStep);
  }

  requestAnimationFrame(scrollStep);
}

function pauseAutoScroll() {
  autoScrollActive = false;
}

function resumeAutoScroll() {
  autoScrollActive = true;
  startAutoScroll(); // Resume scroll when called again
}


function activateFadeInObserver() {
  const fadeElements = document.querySelectorAll(".fade-in");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add("visible");

          // 🚀 Start scroll when first element is fading in
          if (!autoScrollStarted) {
            autoScrollStarted = true;
            autoScrollActive = true;  // <-- THIS LINE IS KEY
            startAutoScroll();
          }

        }, index * 200);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  fadeElements.forEach(el => {
    el.classList.remove("visible"); // reset
    observer.observe(el);
  });
}

let autoScrollActive = true;
let autoScrollStarted = false;

document.addEventListener("DOMContentLoaded", () => {
  const revealBtn = document.getElementById("revealBtn");
  const overlay = document.querySelector(".reveal-overlay");
  const bgMusic = document.getElementById("bgMusic");
  let hasClicked = false;

  // Navbar buttons interaction logic
  const triggers = document.querySelectorAll('.popup-trigger');
  const closeBtns = document.querySelectorAll('.close-btn');
  const allPopups = document.querySelectorAll('.popup-card');
  const btnSah = document.getElementById("btnSah");
  const btnUcap = document.getElementById("btnUcap");
  const rsvpPopup = document.getElementById("rsvpPopup");
  const attendForm = document.getElementById("attendForm");
  const wishForm = document.getElementById("wishForm");

  const paxSelect = document.getElementById("attendPax");
for (let i = 1; i <= 20; i++) {
  const option = document.createElement("option");
  option.value = i;
  option.textContent = i;
  paxSelect.appendChild(option);
}


  function renderUcapan(name, text) {
  const ucapanList = document.getElementById("ucapanList");
  if (!ucapanList) {
    console.warn("ucapanList container not found");
    return;
  }

  const messageEl = document.createElement("div");
  messageEl.classList.add("ucapan-message");
  messageEl.innerHTML = `
    <p class="ucapan-text">"${text}"</p>
    <p class="ucapan-name">${name}</p>
  `;
  ucapanList.appendChild(messageEl);
}

// Load wishes - FAMILY VERSION
function loadWishes() {
  const wishesRef = ref(db, "wishesFamily");
  get(wishesRef)
    .then(snapshot => {
      if (snapshot.exists()) {
        const wishes = Object.values(snapshot.val()).reverse();
        wishes.forEach(({ name, text }) => {
          renderUcapan(name, text);
        });
      } else {
        console.log("No wishes found.");
      }
    })
    .catch(err => {
      console.error("Error loading wishes:", err);
      const ucapanList = document.getElementById("ucapanList");
      if (ucapanList) {
        ucapanList.innerHTML += `<p>Could not load wishes, try again later.</p>`;
      }
    });
}

loadWishes(); // Call it on page load


wishForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("wishName").value.trim();
  const text = document.getElementById("wishText").value.trim();

  if (!name || !text) {
    alert("Please fill in both name and wish!");
    return;
  }

  try {
    const wishesRef = ref(db, "wishesFamily");
    const newWishRef = push(wishesRef);

    await set(newWishRef, {
      name,
      text,
      timestamp: Date.now()
    });

    alert("Your wish has been sent! Thank you!");
    wishForm.reset();

    document.getElementById("wishPopup").classList.remove("active");
    document.getElementById("rsvpPopup").classList.add("active");

  } catch (err) {
    console.error("Firebase error (wish):", err);
    alert("Something went wrong. Please try again later.");
  }
});

  attendForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("attendName").value.trim();
  const status = document.getElementById("attendOption").value;
  const pax = document.getElementById("attendPax").value;

  if (!name || !status || !pax) {
    alert("Please fill all attendance fields!");
    return;
  }

  try {
    const attendRef = ref(db, "Family");
    const newAttendeeRef = push(attendRef);

    await set(newAttendeeRef, {
      name,
      status,
      pax: parseInt(pax),
      timestamp: Date.now()
    });

    alert(`Thanks, ${name}! Your attendance has been recorded.`);

    attendForm.reset();
    document.getElementById("attendPopup").classList.remove("active");
    document.getElementById("rsvpPopup").classList.add("active");

  } catch (err) {
    console.error("Firebase error (attendance):", err);
    alert("Something went wrong. Please try again later.");
  }
});


  // Add click event to navbar triggers (for opening popups)
  triggers.forEach(trigger => {
    trigger.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent click from bubbling up to document

      const popupId = this.getAttribute('data-popup');
      const popup = document.getElementById(popupId);

      // Check if the popup is already open
      if (popup.classList.contains('active')) {
        // If it's open, close it
        popup.classList.remove('active');
        resumeAutoScroll();  // Resume auto-scroll when popup is closed
      } else {
        // Close any currently open popups
        allPopups.forEach(popup => {
          popup.classList.remove('active');
        });
        // Open the selected popup
        popup.classList.add('active');
        pauseAutoScroll();  // Pause auto-scroll when popup is opened
      }
    });
  });


  // Function to open the RSVP card
  function openRsvpCard() {
    console.log("inside")
    rsvpPopup.classList.add("active");
    pauseAutoScroll();  // Pause auto-scroll when opening RSVP card
  }

  // Event listener for 'Sahkan Kehadiran' button (btnSah)
  btnSah.addEventListener("click", (e) => {
    e.stopPropagation();  // ⛔️ Prevent document click from closing the popup
    console.log("clicked");
    openRsvpCard();
  });

  btnUcap.addEventListener("click", (e) => {
    e.stopPropagation();  // ⛔️ Same here
    console.log("clicked");
    openRsvpCard();
  });

    // Handle "Batal" buttons
  const cancelBtns = document.querySelectorAll(".cancel-btn");

  cancelBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      // Close all popups
      allPopups.forEach(popup => {
        popup.classList.remove("active");
      });

      // Reopen the main RSVP popup
      rsvpPopup.classList.add("active");
      pauseAutoScroll(); // still pause autoscroll just in case
    });
  });


  // Add click event to all close buttons
  closeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      this.closest('.popup-card').classList.remove('active');
      resumeAutoScroll();  // Resume auto-scroll when popup is closed
    });
  });

  document.addEventListener("click", (e) => {
    const clickedInsidePopup = e.target.closest(".popup-card");

    if (!clickedInsidePopup) {
      // Close all popups
      allPopups.forEach(popup => popup.classList.remove("active"));

      // 🚫 STOP auto-scroll on generic user click
      autoScrollActive = false;
      console.log("🛑 Auto-scroll stopped by user click");
    }
  });


  // Prevent popup from closing when clicking inside
  allPopups.forEach(popup => {
    popup.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  });

  // Event listener for Sahkan Kehadiran button (openAttendForm)
  const openAttendForm = document.getElementById("openAttendForm");
  openAttendForm.addEventListener("click", () => {
    // Close any other open popups
    allPopups.forEach(popup => {
      popup.classList.remove('active');
    });

    // Open the attend popup
    document.getElementById('attendPopup').classList.add('active');
    pauseAutoScroll();  // Pause auto-scroll when popup is opened
  });

  // Event listener for Berikan Ucapan button (openWishForm)
  const openWishForm = document.getElementById("openWishForm");
  openWishForm.addEventListener("click", () => {
    // Close any other open popups
    allPopups.forEach(popup => {
      popup.classList.remove('active');
    });

    // Open the wish popup
    document.getElementById('wishPopup').classList.add('active');
    pauseAutoScroll();  // Pause auto-scroll when popup is opened
  });

  revealBtn.addEventListener("click", () => {
    if (hasClicked) return;
    hasClicked = true;

    // 🔓 Trigger door animation
    overlay.classList.add("open");

    // Wait for door animation to finish
    setTimeout(() => {
      try {
        bgMusic.play();
        bgMusic.volume = 0.5;
      } catch (err) {
        console.warn("Music playback error:", err);
      }

      overlay.classList.add('hidden');
      document.body.classList.remove('no-scroll');
      document.body.style.overflow = 'auto';

      // Wait for door animation to finish before proceeding
      setTimeout(() => {
        overlay.style.display = 'none';

        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                entry.target.classList.add("visible");
              }, index * 200);
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1 });

        document.querySelectorAll('.fade-in').forEach(el => {
          el.classList.remove("visible");
          observer.observe(el);
        });

        // Delay before starting auto-scroll
        setTimeout(() => {
          autoScrollActive = true;
          startAutoScroll();
        }, 2000); // Delay of 2 seconds

      }, 500); // Delay after door animation finishes
    }, 1500); // Match with door animation duration
  });


  // Pause music when user switches tabs, resume when they return
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (bgMusic && !bgMusic.paused) {
        bgMusic.pause();
      }
    } else {
      if (bgMusic && bgMusic.paused && hasClicked) {
        bgMusic.play().catch(err => {
          console.warn("Music resume error:", err);
        });
      }
    }
  });

  // Prevent browser from restoring scroll position
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

});

// Reset scroll to top on reload
window.onbeforeunload = () => {
  window.scrollTo(0, 0);
};
