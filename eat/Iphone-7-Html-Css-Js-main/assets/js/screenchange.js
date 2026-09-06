var blackscreen = document.getElementById('black-screen');
var screenlock = document.getElementById('screen');
var pulpit = document.getElementById('after-click');
var turnon = document.getElementById('turnon');
var turnonafter = document.getElementById('turnonafter');
var calculator = document.getElementById('calculator');
var calc = document.getElementById('calc');
var calculator = document.querySelector('.black-background');
var mess = document.getElementById('mess')

var message = document.querySelector('.AppMessage')

var gallery = document.getElementById('gallery');
var galleryis = document.querySelector('.galleryis');


var settings = document.getElementById('settings');
var settingser = document.querySelector('.settingser');

var info = document.getElementById('info');
var infoer = document.querySelector('.infoer');

var call = document.getElementById('call')
var caller = document.querySelector('.caller');

var safari = document.getElementById('safari')
var safarier = document.querySelector('.safarier');

var itunes = document.getElementById('itunes')
var ituneser = document.querySelector('.ituneser');


document.addEventListener('DOMContentLoaded', () => {
    var calc = document.getElementById('calc');
  
    // kalkulator
    calc.addEventListener('click', () => {
      pulpit.style.display = 'none'
      calculator.style.display = 'block';
      blackscreen.style.display = 'none';
    });
    // messenger
    mess.addEventListener('click', () => {
        pulpit.style.display = 'none'
        message.style.display = 'block';
        blackscreen.style.display = 'none';
    })
    // galeria
    gallery.addEventListener('click', () => {
        pulpit.style.display = 'none'
        galleryis.style.display = 'block';
        blackscreen.style.display = 'none';
      });


    //  settings
    settings.addEventListener('click', () => {
        pulpit.style.display = 'none'
        settingser.style.display = 'block';
        blackscreen.style.display = 'none';
      });
    // instagram
    info.addEventListener('click', () => {
        pulpit.style.display = 'none'
        infoer.style.display = 'block';
        blackscreen.style.display = 'none';
      });
    // call
    call.addEventListener('click', () => {
        pulpit.style.display = 'none'
        caller.style.display = 'block';
        blackscreen.style.display = 'none';
      });
    // safari
    safari.addEventListener('click', () => {
        pulpit.style.display = 'none'
        safarier.style.display = 'block';
        blackscreen.style.display = 'none';
      });
    // itunes
    itunes.addEventListener('click', () => {
        pulpit.style.display = 'none'
        ituneser.style.display = 'block';
        blackscreen.style.display = 'none';
      });


  });

turnon.addEventListener('click', () => {
    if (window.getComputedStyle(screenlock).display === 'block') {
        blackscreen.style.display = 'block';
        screenlock.style.display = 'none';
    } else {
        blackscreen.style.display = 'none';
        screenlock.style.display = 'block';
    }

    if (window.getComputedStyle(pulpit).display === 'block') {
        pulpit.style.display = 'none';
        screenlock.style.display = 'none';
        blackscreen.style.display = 'block';
    } 

    if (window.getComputedStyle(calculator).display === 'block') {
        blackscreen.style.display = 'block';
        screenlock.style.display = 'none';
        calculator.style.display = 'none'
    }
    if (window.getComputedStyle(message).display === 'block') {
        blackscreen.style.display = 'block';
        screenlock.style.display = 'none';
        message.style.display = 'none'
    }
    if (window.getComputedStyle(galleryis).display === 'block') {
        blackscreen.style.display = 'block';
        screenlock.style.display = 'none';
        galleryis.style.display = 'none'
    }





    if (window.getComputedStyle(settingser).display === 'block') {
        blackscreen.style.display = 'block';
        screenlock.style.display = 'none';
        settingser.style.display = 'none'
    }


    if (window.getComputedStyle(infoer).display === 'block') {
        blackscreen.style.display = 'block';
        screenlock.style.display = 'none';
        infoer.style.display = 'none'
    }


    if (window.getComputedStyle(caller).display === 'block') {
        blackscreen.style.display = 'block';
        screenlock.style.display = 'none';
        caller.style.display = 'none'
    }


    if (window.getComputedStyle(safarier).display === 'block') {
        blackscreen.style.display = 'block';
        screenlock.style.display = 'none';
        safarier.style.display = 'none'
    }


    if (window.getComputedStyle(ituneser).display === 'block') {
        blackscreen.style.display = 'block';
        screenlock.style.display = 'none';
        ituneser.style.display = 'none'
    }
});

turnonafter.addEventListener('click', () => {
    if (
        window.getComputedStyle(screenlock).display === 'block' &&
        window.getComputedStyle(blackscreen).display === 'none'
    ) {
        screenlock.style.display = 'none';
        pulpit.style.display = 'block';

    }

    if(window.getComputedStyle(calculator).display === 'block'){
        calculator.style.display = 'none';
        pulpit.style.display = 'block';
        blackscreen.style.dispaly = 'none';
    }
    if(window.getComputedStyle(message).display === 'block'){
        message.style.display = 'none';
        pulpit.style.display = 'block';
        blackscreen.style.dispaly = 'none';
    }
    if(window.getComputedStyle(galleryis).display === 'block'){
        galleryis.style.display = 'none';
        pulpit.style.display = 'block';
        blackscreen.style.dispaly = 'none';
    }


    if(window.getComputedStyle(settingser).display === 'block'){
        settingser.style.display = 'none';
        pulpit.style.display = 'block';
        blackscreen.style.dispaly = 'none';
    }

    if(window.getComputedStyle(infoer).display === 'block'){
        infoer.style.display = 'none';
        pulpit.style.display = 'block';
        blackscreen.style.dispaly = 'none';
    }

    if(window.getComputedStyle(caller).display === 'block'){
        caller.style.display = 'none';
        pulpit.style.display = 'block';
        blackscreen.style.dispaly = 'none';
    }

    if(window.getComputedStyle(safarier).display === 'block'){
        safarier.style.display = 'none';
        pulpit.style.display = 'block';
        blackscreen.style.dispaly = 'none';
    }

    if(window.getComputedStyle(ituneser).display === 'block'){
        ituneser.style.display = 'none';
        pulpit.style.display = 'block';
        blackscreen.style.dispaly = 'none';
    }
});







  