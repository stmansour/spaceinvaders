THISDIR        := js
CANDIDATES_DIR := ../candidates
APP            := spaceinvaders

# Specify files in strict dependency order:
JS_FILES = \
	util.js \
	sound.js \
	imgprimitive.js \
	bomb.js \
	bombs.js \
	bunker.js \
	bunkers.js \
	explosion.js \
	invader.js \
	squadron.js \
	invaders.js \
	mystery.js \
	lasercannon.js \
	shot.js \
	shots.js \
	player.js \
	revealer.js \
	console.js \
	screen.js \
	app.js \
	main.js

.PHONY: build package release clean test

build:
	@echo "Concatenating JavaScript files into $(CANDIDATES_DIR)/$(APP).js..."
	@for f in $(JS_FILES); do \
		sed -e 's/^import .* from .*;//g' -e 's/^export //g' "$$f" >> $(CANDIDATES_DIR)/$(APP).js; \
		echo "" >> $(CANDIDATES_DIR)/$(APP).js; \
	done
	@echo "*** $(THISDIR): completed build ***"

package:
	@echo "*** $(THISDIR): completed package ***"

release:
	@echo "*** $(THISDIR): completed release ***"

clean:
	@echo "*** $(THISDIR): completed clean ***"

test:
	node -c $(JS_FILES)
	@echo "*** $(THISDIR): completed test ***"
