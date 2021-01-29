let debug = 0.8; // To be fixed in next release
const wipeTransitionTime = 1000*debug; // in milliseconds

function getNPSData(callback) {
    fetch('nps.json', {
    })
    .then( res => {return res.json()})
    .then( jsonRes => callback(jsonRes));

}

// This function was found on https://bost.ocks.org/mike/shuffle/
function generateRandomParkOrder(array) {
    var m = array.length, t, i;
  
    // While there remain elements to shuffle…
    while (m) {
  
      // Pick a remaining element…
      i = Math.floor(Math.random() * m--);
  
      // And swap it with the current element.
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
  
    return array;
}

function renderQuestion(park, img, hint=0) {

    document.querySelector('.park-name').innerHTML = '???'
    document.querySelector('.park-description').innerHTML = '???????????????????????????'
    document.querySelector('.park-description').classList.add('text-center', 'green');


    if (hint == 0) {
        document.querySelector('.park-img').src = img.src;
    }
    if (hint > 0) {
        document.querySelector('.park-name').classList.add('green');
        document.querySelector('.park-description').classList.remove('text-center', 'green');
        document.querySelector('.park-description').innerHTML = park.description.replaceAll(/Alabama|Alaska|American Samoa|Arizona|Arkansa|California|Colorado|Connecticut|Delaware|District of Columbia|Federated States of Micronesia|Florida|Georgia|Guam|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Marshall Islands|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Northern Mariana Islands|Ohio|Oklahoma|Oregon|Palau|Pennsylvania|Puerto Rico|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virgin Island|Virginia|Washington|West Virginia|Wisconsin|Wyoming/ig, '_____');  
        document.querySelector('.park-description').innerHTML = document.querySelector('.park-description').innerHTML.replaceAll(park.name, '<span class="green">_____</span>');    
    }
    if (hint > 1) {
        document.querySelector('.park-name').classList.remove('green');
        document.querySelector('.park-name').innerHTML = park.name;
        document.querySelector('.park-description').innerHTML = document.querySelector('.park-description').innerHTML.replaceAll('<span class="green">_____</span>', `<span class="green">${park.name}</span>`); 
    }

    return park.states;
    
}


function displayQuestion() {
    document.querySelector('.btn-next').classList.add('disabled');
    document.querySelector('.btn-next').blur();
    document.querySelector('.question-counter').innerHTML = parseInt(document.querySelector('.question-counter').innerHTML) + 1;

    document.querySelector('.answer-mask').style.width = 0;
    document.querySelector('.text-input').value = '';


    setTimeout( () => {
        document.querySelector('.answer-mask').style.zIndex = 5;
        document.querySelector('.question-mask').style.zIndex = 10;
        document.querySelector('.answer-mask').style.width = '100%';
        document.querySelector('.btn-submit').classList.remove('disabled');
    }, wipeTransitionTime)

    document.querySelector('.score').innerHTML = document.querySelector('.score').getAttribute('data-score');
}

function lonLatToXY(longitude, latitude) {
    let west = -124.73;
    let east = -66.57;
    let south = 24.544233;
    let north = 49.384422;
    let width = 1452;
    let height = 796;
    // longitude = -103.190020
    // latitude = 37
    // console.log((width) * Math.abs(longitude - west) / Math.abs(west - east))
    // let x = ((longitude - east) / (west - east)) * width;
    x = (width) * (longitude - west) / Math.abs(west - east);
    y = (height) * Math.abs(latitude - north) / Math.abs(north - south);
    return {x:x, y:y};
}

function showTooltip(e) {
    let element = e.srcElement;
    let tooltip = document.querySelector('.tooltip')
    tooltip.innerHTML = element.getAttribute('parkname');
    tooltip.style.visibility = 'visible';
}

function hideTooltip() {
    document.querySelector('.tooltip').style.visibility = 'hidden';
}



function renderAnswer(correctAnswer, park) {
    const userAnswer = getStateTwoDigitCode(document.querySelector('.text-input').value);
    let correctStates = correctAnswer.split(',');
    let cord = lonLatToXY(park.longitude, park.latitude);

    if (correctAnswer.includes(userAnswer)) {
        document.querySelector('.answer-container').className = document.querySelector('.answer-container').className.replace('red', 'green');
        document.querySelector('.answer-container i').className = 'fas fa-check fa-9x';
        document.querySelector('.answer-container h1').innerHTML = '+1';
        document.querySelector('.answer-container input').classList.add('btn-green-outline');
        document.querySelector('.answer-container input').classList.remove('btn-red-outline');
        document.querySelector('.score').setAttribute('data-score', parseInt(document.querySelector('.score').innerHTML) + 1)
        for (let i of correctStates) {
            states[i].numberOfParks++;
            states[i].correctParks++;
        }
        document.querySelector('svg').innerHTML += `<circle cx='${cord.x}' cy='${cord.y + 25}' r='15' fill='#33ff00' parkname='${park.name}' onmouseenter='showTooltip(event)' onmouseleave='hideTooltip()' ontouchstart='showTooltip(event)' ontouchend='hideTooltip()'> </circle>`
    } else {
        document.querySelector('.answer-container').className = document.querySelector('.answer-container').className.replace('green', 'red');
        document.querySelector('.answer-container i').className = 'fas fa-times fa-9x';
        document.querySelector('.answer-container h1').innerHTML = '';
        document.querySelector('.answer-container input').classList.add('btn-red-outline');
        document.querySelector('.answer-container input').classList.remove('btn-green-outline');
        for (let i of correctStates) {
            states[i].numberOfParks++;
        }
        document.querySelector('svg').innerHTML += `<circle cx='${cord.x}' cy='${cord.y + 25}' r='15' fill='#ff4000' parkname='${park.name}' onmouseenter='showTooltip(event)' onmouseleave='hideTooltip()' ontouchstart='showTooltip(event)' ontouchend='hideTooltip()'> </circle>`
    }

 
    let stateNamesString = '';
    for (let i in correctStates) {
        if (i > 0) {
            stateNamesString += ', ';
        }
        stateNamesString += getStateFullName(correctStates[i]);
    }

    document.querySelector('.state-answer').innerHTML = stateNamesString + ' - ' + park.name;

   // map['correctParks'].push(park)




}

function displayAnswer() {
    document.querySelector('.question-mask').style.width = 0;
    document.querySelector('.btn-submit').classList.add('disabled');
    document.querySelector('.btn-submit').blur();

    setTimeout( () => {
        document.querySelector('.question-mask').style.zIndex = 5;
        document.querySelector('.answer-mask').style.zIndex = 10;
        document.querySelector('.question-mask').classList.add('no-transitions');
        document.querySelector('.question-mask').style.width = '100%';
        setTimeout( () => {
            document.querySelector('.btn-next').classList.remove('disabled');
            document.querySelector('.question-mask').classList.remove('no-transitions');
        }, 10);
    }, wipeTransitionTime)

 
}


function menuPage() {
    document.querySelector('.card').innerHTML = renderMenuPage();

    document.querySelector('.status').classList.add('hidden');

    document.querySelector('.question-slider').addEventListener('input', () => {
        document.querySelector('.question-display').innerHTML = document.querySelector('.question-slider').value;
    })

    document.querySelector('.btn-start').addEventListener('click', () => {
        getNPSData( (res) => {
            gamePage(res.data, document.querySelector('.question-slider').value);
        })
    });
}

function gamePage(data, numberOfQuestions) {

    document.querySelector('.card').innerHTML = renderGamePage();

    document.querySelector('.status').classList.remove('hidden');

    // Reset states object in case user restarts game
    for (let i in states) {
        states[i].numberOfParks = 0;
        states[i].correctParks = 0;
    }

    let parks = [];
    for (let i in data) {
        if (data[i].designation.includes("National Park")) parks.push(data[i]); 
    }

    // for (let i in parks) {
    //     if (parks[i].states == 'HI' || parks[i].states == 'AK' || parks[i].states == 'AS' || parks[i].states == 'VI') continue;
    //     let cord = lonLatToXY(parks[i].longitude, parks[i].latitude)
    //     document.querySelector('svg').innerHTML += `<circle cx='${cord.x}px' cy='${cord.y+25}' r='8' fill='#33ff00' </circle>`
    // }


    generateRandomParkOrder(parks);
    let parkIterator = 0;
    let img = new Image;
    let randomIndex = Math.floor(Math.random() * Object.keys(parks[parkIterator].images).length);
    img.src = parks[parkIterator].images[randomIndex].url;
    let correctAnswer = renderQuestion(parks[parkIterator], img);
    let hint = 0;

    randomIndex = Math.floor(Math.random() * Object.keys(parks[parkIterator + 1].images).length);
    img.src = parks[parkIterator + 1].images[randomIndex].url;


    document.querySelector('.question-counter').innerHTML = 1;
    document.querySelector('.question-total').innerHTML = numberOfQuestions;
    document.querySelector('.score').innerHTML = 0;


    document.querySelector('.fullscreen-container').addEventListener('click', toggleImgFullscreen);

    document.addEventListener('fullscreenchange', () => {
        document.querySelector('.park-img').classList.toggle('fullscreen');
    });

    function toggleImgFullscreen() {
        if (!document.fullscreenElement) {
            document.querySelector('.fullscreen-container').requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    document.addEventListener('keyup', keyboardHandler);

    document.querySelector('.btn-submit').addEventListener('click', () => {
        submitBtnHandler();
    });

    document.querySelector('.btn-submit').addEventListener('keypress', (e) => {
        e.preventDefault();
    });

    document.querySelector('.btn-next').addEventListener('click', () => {
        nextBtnHandler()
    })

    document.querySelector('.btn-next').addEventListener('keypress', (e) => {
        e.preventDefault();
    });

    document.querySelector('.btn-hint').addEventListener('click', hintHander);

    let svgImage = document.querySelector('svg');
    let svgContainer = document.querySelector('.svg-container');


    var viewBox = {x:0,y:0,w:svgImage.clientWidth,h:svgImage.clientHeight};
    svgImage.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
    const svgSize = {w:svgImage.clientWidth,h:svgImage.clientHeight};
    var isPanning = false;
    let isZomming = false;
    var startPoint = {x:0,y:0};
    var endPoint = {x:0,y:0};
    var scale = 1;
    let startPoint2 = {x:0,y:0};
    let endPoint2 = {x:0,y:0}
    let rect = svgImage.getBoundingClientRect();
    
    let startX = 0;
    let startY = 0;

    document.querySelector('.text-input').addEventListener('blur', () => {
        window.scrollTo(0, 0);
    })

    document.querySelector('.svg-container').onwheel = function(e) {
        e.preventDefault();



        var w = viewBox.w;
        var h = viewBox.h;
        var mx = e.offsetX;//mouse x  
        var my = e.offsetY;  
        scale = svgSize.w/viewBox.w;
        if (((viewBox.w >= 1452 || viewBox.h >= 870 ) && e.deltaY > 0) || ((viewBox.w <= 332 || viewBox.h <= 200 ) && e.deltaY < 0) ) {
            var dx = 0;
            var dy = 0;
            var dw = 0;
            var dh = 0;
        } else { 
            var dw = w*Math.sign(-e.deltaY)*0.04;
            var dh = h*Math.sign(-e.deltaY)*0.04;
            var dx = dw*mx/svgSize.w;
            var dy = dh*my/svgSize.h;
 
        }
        console.log(scale)
        document.querySelectorAll('circle').forEach( (circle) => {
            circle.setAttribute('r', ((viewBox.w - 332) / (1452 - 332) * 17) + 8) 
        })

        viewBox = {x:viewBox.x+dx,y:viewBox.y+dy,w:viewBox.w-dw,h:viewBox.h-dh};
        svgImage.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
    }

    

    svgContainer.onmousedown = function(e){
        isPanning = true;
        startPoint = {x:e.x,y:e.y};  
    }

    svgContainer.ontouchstart = function(e){
        e.preventDefault();
        



        isPanning = true;
        startPoint = {x:e.touches[0].screenX - rect.left ,y:e.touches[0].screenY - 242};   
        

        if (e.touches[1]) {
            startPoint2 = {x:e.touches[1].screenX - rect.left,y:e.touches[1].screenY - 242}
            isZomming = true;

            startX = (startPoint.x + startPoint2.x ) / 2
            
            startY = (startPoint.y + startPoint2.y ) / 2
           
        }

        let tooltip = document.querySelector('.tooltip')
        let tooltipRect = tooltip.getBoundingClientRect();
        document.querySelector('.tooltip').style.left = e.touches[0].screenX - rect.left - ((tooltipRect.right - tooltipRect.left) / 2) + 'px';
        document.querySelector('.tooltip').style.top = e.touches[0].screenY - 242 - 75 + 'px';
    }
    
    svgContainer.onmousemove = function(e){
        if (isPanning){
            endPoint = {x:e.x,y:e.y};
            var dx = (startPoint.x - endPoint.x)/scale;
            var dy = (startPoint.y - endPoint.y)/scale;
            var movedViewBox = {x:viewBox.x+dx,y:viewBox.y+dy,w:viewBox.w,h:viewBox.h};
            svgImage.setAttribute('viewBox', `${movedViewBox.x} ${movedViewBox.y} ${movedViewBox.w} ${movedViewBox.h}`);
        }

        let tooltip = document.querySelector('.tooltip')
        let tooltipRect = tooltip.getBoundingClientRect();
        document.querySelector('.tooltip').style.left = e.pageX - rect.left - ((tooltipRect.right - tooltipRect.left) / 2) + 'px';
        document.querySelector('.tooltip').style.top = e.pageY - 242 + 'px';
    }

    svgContainer.ontouchmove = function(e){
        if (isPanning){
            endPoint = {x:e.touches[0].screenX - rect.left,y:e.touches[0].screenY - 242};
            var dx = (startPoint.x - endPoint.x)/scale;
            var dy = (startPoint.y - endPoint.y)/scale;
            var movedViewBox = {x:viewBox.x+dx,y:viewBox.y+dy,w:viewBox.w,h:viewBox.h};
            svgImage.setAttribute('viewBox', `${movedViewBox.x} ${movedViewBox.y} ${movedViewBox.w} ${movedViewBox.h}`);
        }
        if (isZomming) {
            endPoint = {x:e.touches[0].screenX - rect.left,y:e.touches[0].screenY - 242};
            endPoint2 = {x:e.touches[1].screenX - rect.left,y:e.touches[1].screenY - 242};
            let startDistance = Math.sqrt(Math.pow(startPoint.x - startPoint2.x, 2) + Math.pow(startPoint.y - startPoint2.y, 2));
            let endDistance =  Math.sqrt(Math.pow(endPoint.x - endPoint2.x, 2) + Math.pow(endPoint.y - endPoint2.y, 2));
            let delta = endDistance / startDistance - 1;

            

            startPoint.x = endPoint.x;
            startPoint.y = endPoint.y;
            startPoint2.x = endPoint2.x;
            startPoint2.y = endPoint2.y;

            var w = viewBox.w;
            var h = viewBox.h;

            var dw = w*delta;
            var dh = h*delta;


            var dx = dw*startX/svgSize.w;
            var dy = dh*startY/svgSize.h;
            scale = svgSize.w/viewBox.w;
            viewBox = {x:viewBox.x+dx,y:viewBox.y+dy,w:viewBox.w-dw,h:viewBox.h-dh};
            svgImage.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);


        }

        
    }
    
    svgContainer.onmouseup = function(e){
        if (isPanning){ 
            endPoint = {x:e.x,y:e.y};
            var dx = (startPoint.x - endPoint.x)/scale;
            var dy = (startPoint.y - endPoint.y)/scale;
            viewBox = {x:viewBox.x+dx,y:viewBox.y+dy,w:viewBox.w,h:viewBox.h};
            svgImage.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
            isPanning = false;
        }
    }

    svgContainer.ontouchend = function(e){
        if (isPanning){ 
            if (!endPoint.x == 0 && !endPoint.y == 0) {
                var dx = (startPoint.x - endPoint.x)/scale;
                var dy = (startPoint.y - endPoint.y)/scale;
                viewBox = {x:viewBox.x+dx,y:viewBox.y+dy,w:viewBox.w,h:viewBox.h};
                svgImage.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
            }
            isPanning = false;
            endPoint.x = 0;
            endPoint.y = 0;
        }
        if (isZomming) {
            isZomming = false;
        }
    }
    
    svgContainer.onmouseleave = function(e){
        isPanning = false;
    }

    function keyboardHandler(e) {
        if (e.key == 'Enter') {
            if (document.querySelector('.question-mask').style.zIndex == 10 && !document.querySelector('.btn-submit').classList.contains('disabled')) {
                // When question is displayed
                submitBtnHandler();
            } else  if (document.querySelector('.answer-mask').style.zIndex == 10 && !document.querySelector('.btn-next').classList.contains('disabled')) {
                // When answer is displayed
                nextBtnHandler();
            }
        }
    }

    function submitBtnHandler() {
        renderAnswer(correctAnswer, parks[parkIterator++]);
        displayAnswer();
        hint = 0;
        document.querySelector('.btn-hint').classList.remove('disabled');
        setTimeout(() => {correctAnswer = renderQuestion(parks[parkIterator], img)}, wipeTransitionTime );
    }

    function nextBtnHandler() {
        if (parkIterator < numberOfQuestions) {
            displayQuestion();
            // load next image
            randomIndex = Math.floor(Math.random() * Object.keys(parks[parkIterator + 1].images).length);
            img.src = parks[parkIterator + 1].images[randomIndex].url;
        } else {
            document.querySelector('.score').innerHTML = document.querySelector('.score').getAttribute('data-score');
            resultPage();
        }
    }

    function hintHander() {
        renderQuestion(parks[parkIterator], img, ++hint);
        if (hint > 1) {
            document.querySelector('.btn-hint').classList.add('disabled');
            document.querySelector('.btn-hint').blur();
        }
    }
}

function resultPage() {
    document.querySelector('.card').innerHTML = renderResultsPage();

    document.querySelector('.btn-restart').addEventListener('click', () => {
        menuPage();
    })
}


menuPage();

states = {
    AZ: {numberOfParks: 0, correctParks: 0},
    AL: {numberOfParks: 0, correctParks: 0},
    AK: {numberOfParks: 0, correctParks: 0},
    AS: {numberOfParks: 0, correctParks: 0},
    AR: {numberOfParks: 0, correctParks: 0},
    CA: {numberOfParks: 0, correctParks: 0},
    CO: {numberOfParks: 0, correctParks: 0},
    CT: {numberOfParks: 0, correctParks: 0},
    DC: {numberOfParks: 0, correctParks: 0},
    DE: {numberOfParks: 0, correctParks: 0},
    FL: {numberOfParks: 0, correctParks: 0},
    GA: {numberOfParks: 0, correctParks: 0},
    HI: {numberOfParks: 0, correctParks: 0},
    ID: {numberOfParks: 0, correctParks: 0},
    IL: {numberOfParks: 0, correctParks: 0},
    IN: {numberOfParks: 0, correctParks: 0},
    IA: {numberOfParks: 0, correctParks: 0},
    KS: {numberOfParks: 0, correctParks: 0},
    KY: {numberOfParks: 0, correctParks: 0},
    LA: {numberOfParks: 0, correctParks: 0},
    ME: {numberOfParks: 0, correctParks: 0},
    MD: {numberOfParks: 0, correctParks: 0},
    MA: {numberOfParks: 0, correctParks: 0},
    MI: {numberOfParks: 0, correctParks: 0},
    MN: {numberOfParks: 0, correctParks: 0},
    MS: {numberOfParks: 0, correctParks: 0},
    MO: {numberOfParks: 0, correctParks: 0},
    MT: {numberOfParks: 0, correctParks: 0},
    NE: {numberOfParks: 0, correctParks: 0},
    NV: {numberOfParks: 0, correctParks: 0},
    NH: {numberOfParks: 0, correctParks: 0},
    NJ: {numberOfParks: 0, correctParks: 0},
    NM: {numberOfParks: 0, correctParks: 0},
    NY: {numberOfParks: 0, correctParks: 0},
    NC: {numberOfParks: 0, correctParks: 0},
    ND: {numberOfParks: 0, correctParks: 0},
    OH: {numberOfParks: 0, correctParks: 0},
    OK: {numberOfParks: 0, correctParks: 0},
    OR: {numberOfParks: 0, correctParks: 0},
    PA: {numberOfParks: 0, correctParks: 0},
    RI: {numberOfParks: 0, correctParks: 0},
    SC: {numberOfParks: 0, correctParks: 0},
    SD: {numberOfParks: 0, correctParks: 0},
    TN: {numberOfParks: 0, correctParks: 0},
    TX: {numberOfParks: 0, correctParks: 0},
    UT: {numberOfParks: 0, correctParks: 0},
    VT: {numberOfParks: 0, correctParks: 0},
    VI: {numberOfParks: 0, correctParks: 0},
    VA: {numberOfParks: 0, correctParks: 0},
    WA: {numberOfParks: 0, correctParks: 0},
    WV: {numberOfParks: 0, correctParks: 0},
    WI: {numberOfParks: 0, correctParks: 0},
    WY: {numberOfParks: 0, correctParks: 0} 
}

map = {
    correctParks: [],
    wrongParks: []
}


