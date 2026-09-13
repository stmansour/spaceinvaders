THISDIR := assets

.PHONY: build package release clean test

build:
	@echo "*** $(THISDIR): completed build ***"

DIST_TARGET := $(if $(APP_DIST),$(APP_DIST),$(if $(SPACEINVADERS_DIST),$(SPACEINVADERS_DIST),../dist))

package:
	# Copy all assets (images, fonts) to distribution directory
	mkdir -p $(DIST_TARGET)/assets
	cp -r * $(DIST_TARGET)/assets/ 2>/dev/null || true
	rm -f $(DIST_TARGET)/assets/Makefile
	@echo "*** $(THISDIR): completed package ***"

release:
	mkdir -p $(DIST_TARGET)/assets
	cp -r * $(DIST_TARGET)/assets/ 2>/dev/null || true
	rm -f $(DIST_TARGET)/assets/Makefile
	@echo "*** $(THISDIR): completed release ***"

clean:
	@echo "*** $(THISDIR): completed clean ***"

test:
	@echo "*** $(THISDIR): completed test ***"
