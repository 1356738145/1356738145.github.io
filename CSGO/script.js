// Mapping of map names to scatter images
const scatterImages = {
    dust2: { 
        fire: 'dust2_fire.png', 
        HE: 'dust2_HE.png' ,
        smoke: 'dust2_smoke.png',
        zeus: 'dust2_zeus.png',
        shotgun: 'dust2_shotgun.png',
        knife: 'dust2_knife.png',
        flash: 'dust2_flash.png'},
        
    inferno: { 
        fire: 'inferno_fire.png',
        HE: 'inferno_HE.png' ,
        smoke: 'inferno_smoke.png',
        zeus: 'inferno_zeus.png',
        shotgun: 'inferno_shotgun.png',
        knife: 'inferno_knife.png',
        flash: 'inferno_flash.png'
    },
    mirage: {
        fire: 'mirage_fire.png',
        HE: 'mirage_HE.png',
        smoke: 'mirage_smoke.png',
        zeus: 'mirage_zeus.png',
        shotgun: 'mirage_shotgun.png',
        knife: 'mirage_knife.png',
        flash: 'mirage_flash.png'
      }
  };
  


  function changeImage(Mapname, imageSrc) {
    const mainImage = document.getElementById('mainImage');
    mainImage.src = imageSrc;
  
    // Clear any existing overlay image before changing main image
    clearOverlay();
  
    // Update scatter buttons based on selected map
    updateScatterButtons(Mapname);

  }
  
  function updateScatterButtons(Mapname) {
    const scatterButtons = document.getElementById('scatterButtons');
    scatterButtons.style.display = 'block'; // Show scatter buttons
  
    // Update onclick event for scatter buttons
    const fireButton = document.querySelector('#scatterButtons button:nth-child(1)');
    const HEButton = document.querySelector('#scatterButtons button:nth-child(2)');
    const smokeButton = document.querySelector('#scatterButtons button:nth-child(3)');
    const zeusButton = document.querySelector('#scatterButtons button:nth-child(4)');
    const shotgunButton = document.querySelector('#scatterButtons button:nth-child(5)');
    const knifeButton = document.querySelector('#scatterButtons button:nth-child(6)');
    const flashButton = document.querySelector('#scatterButtons button:nth-child(7)');
    
    fireButton.setAttribute('onclick', `showScatter('fire', '${Mapname}')`);
    HEButton.setAttribute('onclick', `showScatter('HE', '${Mapname}')`);
    smokeButton.setAttribute('onclick', `showScatter('smoke', '${Mapname}')`);
    zeusButton.setAttribute('onclick', `showScatter('zeus', '${Mapname}')`);
    shotgunButton.setAttribute('onclick', `showScatter('shotgun', '${Mapname}')`);
    knifeButton.setAttribute('onclick', `showScatter('knife', '${Mapname}')`);
    flashButton.setAttribute('onclick', `showScatter('flash', '${Mapname}')`);
  }
  
  let currentOverlayImage = null; // 用于存储当前显示的 overlay-image 元素



  function showScatter(type, Mapname) {
    clearOverlay(); // 清除现有的 overlay 图像
    
    const overlayImage = new Image();
    const imageContainer = document.getElementById('imageContainer');
    
    const scatterImageSrc = scatterImages[Mapname][type];
    overlayImage.src = scatterImageSrc;
    
    overlayImage.classList.add('overlay-image');
    
    overlayImage.addEventListener('load', function() {
      overlayImage.classList.add('show'); // 图像加载完成后添加 show 类显示图像
    });
      
    
    imageContainer.appendChild(overlayImage);

  
    // 如果有旧的 overlay-image 元素，延迟隐藏旧元素
    if (currentOverlayImage) {
      setTimeout(function() {
        currentOverlayImage.style.opacity = '0'; // 将旧元素的 opacity 设置为 0，使其渐隐
      }, 1000); // 这里的延迟时间需要根据过渡效果的时间来调整
    }
  
    currentOverlayImage = overlayImage; // 更新当前显示的 overlay-image 元素
  }
  
  function clearOverlay() {
    const imageContainer = document.getElementById('imageContainer');
    if (currentOverlayImage) {
      imageContainer.removeChild(currentOverlayImage);
      currentOverlayImage = null;
    }
  }

// JavaScript for generating snowflakes
document.addEventListener("DOMContentLoaded", function() {
  const numSnowflakes = 50; // Number of snowflakes to generate

  const snowflakesContainer = document.querySelector('.snowflakes');
  const vis1Container = document.querySelector('.vis1');

  for (let i = 0; i < numSnowflakes; i++) {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.style.left = `${Math.random() * 100}%`; // Random horizontal position
    snowflake.style.animationDuration = `${Math.random() * 5 + 3}s`; // Random speed
    snowflake.style.animationDelay = `${Math.random() * 2}s`; // Random start delay
    snowflakesContainer.appendChild(snowflake);
  }
});