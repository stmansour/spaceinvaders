# ─────────────────────────────────────────────────────────────────────────────
# Space Invaders (1978 Arcade) — Makefile
# ─────────────────────────────────────────────────────────────────────────────

DIRS                   := css js assets
APP                    := spaceinvaders
DIST                   := dist
CANDIDATES_DIR         := candidates

# Remote server deployment (matching tempest / rubiks conventions)
SSH_KEY                := ~/.ssh/id_sman
SSH_PORT               := 1291
SSH_HOST               := sman@stevemansour.com
REMOTE                 := ~/public_html/games/spaceinvaders

# Absolute path for dist (for passing to submakes)
DIST_ABS               := $(shell pwd)/$(DIST)

export APP_DIST        := $(DIST_ABS)
export SPACEINVADERS_DIST := $(DIST_ABS)

PORT ?= 8888

define write-version
	VER="1.0.0-$$(date -u +%Y%m%dT%H%M%S)"; \
	printf '%s\n' "$$VER" > ${CANDIDATES_DIR}/$(APP)-version.txt; \
	echo "*** $(APP): Version $$VER ***"
endef

define stamp-index
	if [ -f ${CANDIDATES_DIR}/$(APP)-version.txt ]; then \
		VER=$$(tr -d '[:space:]' < ${CANDIDATES_DIR}/$(APP)-version.txt); \
	else \
		VER=$$(cksum $(1)/js/$(APP).js | awk '{print $$1}'); \
	fi; \
	sed -e '/src="js\//d' \
	    -e "s|href=\"style.css\"|href=\"css/$(APP).css?v=$$VER\"|" \
	    -e "s|href=\"css/style.css\"|href=\"css/$(APP).css?v=$$VER\"|" \
	    -e "s|src=\"lib/p5.js\"|src=\"js/$(APP).js?v=$$VER\"|" \
	    index.html > $(1)/index.html
endef

.PHONY: all build code validate package clean serve open play release relsman help

all: build package

build: code validate

code:
	@echo "Building aggregated files..."
	rm -rf ${CANDIDATES_DIR}
	mkdir -p ${CANDIDATES_DIR}
	$(call write-version)
	touch ${CANDIDATES_DIR}/$(APP).css
	touch ${CANDIDATES_DIR}/$(APP).js
	for dir in $(DIRS); do \
		$(MAKE) -C $$dir build || exit 1; \
	done
	@echo "*** $(APP): completed code aggregation ***"

validate:
	@echo "Validating JavaScript files (syntax + lint)..."
	$(MAKE) -C js test || exit 1;
	@if command -v npm >/dev/null 2>&1; then \
		npm run validate; \
		if [ -f ${CANDIDATES_DIR}/$(APP).js ]; then \
			echo "Checking aggregated $(APP).js for duplicate function names..."; \
			npx eslint ${CANDIDATES_DIR}/$(APP).js \
				--rule "no-dupe-keys: error" \
				--rule "no-func-assign: error" \
				--rule "no-redeclare: off" \
				--rule "no-unused-vars: off" || exit 1; \
		fi; \
	fi
	@echo "*** $(APP): completed validate ***"

package: 
	@echo "Packaging $(APP) distribution into $(DIST)/..."
	mkdir -p $(DIST)/js $(DIST)/css

	# Bundle p5.min.js + validated game code into single dist/js/$(APP).js
	cat lib/p5.min.js > $(DIST)/js/$(APP).js
	printf '\n' >> $(DIST)/js/$(APP).js
	cat ${CANDIDATES_DIR}/$(APP).js >> $(DIST)/js/$(APP).js

	# Copy aggregated single CSS file
	cp ${CANDIDATES_DIR}/$(APP).css $(DIST)/css/

	# Package assets (images and fonts) from subdirectories
	for dir in $(DIRS); do \
		$(MAKE) -C $$dir package || exit 1; \
	done

	# Stamp index.html with content version hashes into dist/index.html
	$(call stamp-index,$(DIST))
	@echo "*** $(APP): distribution ready in $(DIST)/ ***"

clean:
	rm -rf $(CANDIDATES_DIR) $(DIST)
	for dir in $(DIRS); do \
		$(MAKE) -C $$dir clean || exit 1; \
	done
	@echo "*** $(APP): completed clean ***"

# Preview the production distribution locally
serve: package
	@echo ""
	@echo "========================================================"
	@echo " Space Invaders local production server running at:"
	@echo "   http://localhost:$(PORT)/"
	@echo " Press Ctrl+C to stop the server"
	@echo "========================================================"
	@echo ""
	python3 -m http.server $(PORT) --directory $(DIST)

play: package
	@echo ""
	@echo "========================================================"
	@echo " Space Invaders local production server running at:"
	@echo "   http://localhost:$(PORT)/"
	@echo " Opening game in browser... Press Ctrl+C to stop"
	@echo "========================================================"
	@echo ""
	@(sleep 1 && open "http://localhost:$(PORT)/") &
	python3 -m http.server $(PORT) --directory $(DIST)

open: play

# Optional local macOS web server release
release: package
	rm -rf /Library/WebServer/Documents/games/spaceinvaders
	mkdir -p /Library/WebServer/Documents/games
	cp -R $(DIST) /Library/WebServer/Documents/games/spaceinvaders
	@echo "*** $(APP): completed release — /Library/WebServer/Documents/games/spaceinvaders ***"

# Deploy to stevemansour.com (atomic swap via .new directory, matching tempest/rubiks)
relsman: package
	rsync -az --delete -e "ssh -i $(SSH_KEY) -p $(SSH_PORT)" $(DIST)/ $(SSH_HOST):$(REMOTE).new/
	ssh -i $(SSH_KEY) -p $(SSH_PORT) $(SSH_HOST) 'rm -rf $(REMOTE).bak && mv $(REMOTE) $(REMOTE).bak 2>/dev/null; mv $(REMOTE).new $(REMOTE) && rm -rf $(REMOTE).bak'
	@echo "*** $(APP): completed relsman — live at https://stevemansour.com/games/spaceinvaders/ ***"

help:
	@echo ""
	@echo "  make           — build production bundle into dist/ (single JS, single CSS, assets)"
	@echo "  make build     — aggregate files into candidates/ and run linters"
	@echo "  make package   — package into dist/ with version-stamped index.html"
	@echo "  make validate  — run ESLint and code checkers"
	@echo "  make clean     — remove dist/, candidates/, and temporary build files"
	@echo "  make play      — package dist/, start server on port $(PORT), and open browser"
	@echo "  make serve     — serve dist/ locally at http://localhost:$(PORT)/"
	@echo "  make open      — alias for make play"
	@echo "  make release   — copy dist/ to local macOS web server"
	@echo "  make relsman   — deploy to stevemansour.com via rsync and atomic ssh swap"
	@echo ""
