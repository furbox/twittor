importScripts('js/sw-utils.js');
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const INMUTABLE_CACHE = 'imnutable-v1';

const APP_SHELL = [
    '/',
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/hulk.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/spiderman.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/wolverine.jpg',
    'js/app.js',
    'js/sw-utils.js'
];

const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'css/animate.css',
    'js/libs/jquery.js'
];

self.addEventListener('install', e => {
    //agregamos el cache estatico
    const cacheStatic = caches.open(STATIC_CACHE)
        .then(cache => cache.addAll(APP_SHELL));
    //agregamos el cache dinamico
    const cacheInmutable = caches.open(INMUTABLE_CACHE)
        .then(cache => cache.addAll(APP_SHELL_INMUTABLE));
    //esperamos que se resuelva la promesa antes de la instalacion
    e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});

self.addEventListener('activate', e => {
    //validamos que el cache anterior sea igual al del cache
    const respuesta = caches.keys().then(keys => {
        keys.forEach(key => {
            if (key !== STATIC_CACHE && key.includes('static')) {
                return caches.delete(key);
            }
        });
    });
    e.waitUntil(respuesta);
});

self.addEventListener('fetch', e => {
    const respuesta = caches.match(e.request).then(res => {
        if (res) {
            return res;
        } else {
            return fetch(e.request).then(newRes => {
                return actualizaCacheDinamico(DYNAMIC_CACHE, e.request, newRes);
            });
        }
    });
    e.respondWith(respuesta);
});