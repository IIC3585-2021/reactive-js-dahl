const { fromEvent, interval, timer } = rxjs;
const operator = rxjs.operators;
/**
 * 
 * @param {*} val 
 * añade elementos al html
 */
function print(val) {
  let el = document.createElement('p');
  el.innerText = val;
  document.body.appendChild(el);
}

/**
 * ejemplo observable, produce un data stream de 2 elementos
 */
const observable = rxjs.Observable.create((observer) => {
  observer.next('hh');
  observer.next('ww');
});
observable.subscribe((val) => print(val));

/**
 * observable que genera un stream con los eventos de click 
 */
const clicks = fromEvent(document, 'click');
clicks.subscribe((clickEvent) => console.log(clickEvent));


/**
 * observable que genera un stream con los eventos de keydown 
 */
const keyDown= fromEvent(document, 'keydown');
keyDown.subscribe((keyDownEvent) => console.log(keyDownEvent));