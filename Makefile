# PESO — atalhos de desenvolvimento.
# `make` sozinho lista os alvos disponíveis.

NPM ?= npm
PORT ?= 5173
PREVIEW_PORT ?= 4173

.DEFAULT_GOAL := help
.PHONY: help install dev mobile build preview check clean distclean

help: ## Lista os alvos disponíveis
	@awk 'BEGIN {FS = ":.*?## "; print "Alvos:"} /^[a-zA-Z_-]+:.*?## / {printf "  \033[1m%-10s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Reinstala sozinho quando o manifesto muda; `touch` porque o npm nem sempre
# atualiza a data do diretório.
node_modules: package.json package-lock.json
	$(NPM) install
	@touch node_modules

install: node_modules ## Instala as dependências

dev: node_modules ## Servidor de desenvolvimento (padrão: http://localhost:5173)
	$(NPM) run dev -- --port $(PORT)

# O service worker só registra em localhost ou HTTPS: pela rede local dá para
# conferir o layout no celular, mas não o comportamento offline.
mobile: node_modules ## Igual ao dev, exposto na rede local (abrir no celular)
	$(NPM) run dev -- --host --port $(PORT)

check: node_modules ## Só o type-check
	$(NPM) run typecheck

build: node_modules ## Type-check + build de produção em dist/
	$(NPM) run build

preview: build ## Serve o build de produção — único jeito de testar o PWA
	$(NPM) run preview -- --port $(PREVIEW_PORT)

clean: ## Remove os artefatos de build
	rm -rf dist dev-dist node_modules/.tmp

distclean: clean ## Remove também node_modules
	rm -rf node_modules
