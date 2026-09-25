// sw.js — Service Worker do app "Meus Gastos"
// Responsável por cachear os arquivos do app (app shell) para uso offline.
// Os DADOS ficam no localStorage (não no cache do Service Worker) — por isso
// não somem quando o cache é atualizado.

const CACHE_NAME = "meus-gastos-cache-v9";

// Lista de arquivos que compõem o "esqueleto" do app.
// Se você trocar o nome dos arquivos, atualize aqui também.
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Instalação: baixa e guarda o app shell em cache.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Ativação: remove caches antigos de versões anteriores do app.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Estratégia "cache-first, com atualização em segundo plano":
// tenta responder do cache (rápido, funciona offline) e, em paralelo,
// busca na rede para atualizar o cache para a próxima vez.
self.addEventListener("fetch", (event) => {
  // Só tratamos requisições GET do mesmo site (evita erros com CDNs externos como Tailwind).
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => cached); // sem internet: usa o que tiver em cache

      return cached || fetchPromise;
    })
  );
});
