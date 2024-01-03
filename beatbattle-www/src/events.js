function subscribe(event, listener) {
   document.addEventListener(event, listener);
}

function unsubscribe(event, listener) {
   document.removeEventListener(event, listener);
}

function publish(event, data) {
   const e = new CustomEvent(event, { detail: data });
   document.dispatchEvent(e);
}
 
 export { publish, subscribe, unsubscribe};