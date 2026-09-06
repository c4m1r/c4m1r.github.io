function startTime() {
    const today = new Date();
    let h = today.getHours();
    let m = today.getMinutes();
    m = checkTime(m);
    document.getElementById('clock').innerHTML =  h + ":" + m
    document.getElementById('clock3').innerHTML =  h + ":" + m
    setTimeout(startTime, 1000);

    const dniTygodnia = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];
    const miesiace = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];
    
    const dzienTygodnia = dniTygodnia[today.getDay()];
    const dzienMiesiaca = today.getDate();
    const miesiac = miesiace[today.getMonth()];
    document.getElementById('clock2').innerHTML =  dzienTygodnia + " " + dzienMiesiaca + " " + miesiac;
  }
  
  function checkTime(i) {
    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
    return i;
  }
  window.onload = startTime();



