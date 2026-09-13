THISDIR        := css
CANDIDATES_DIR := ../candidates
APP            := spaceinvaders

CSS_FILES      := style.css

.PHONY: build package release clean test

build:
	@echo "Concatenating CSS files into $(CANDIDATES_DIR)/$(APP).css..."
	cat $(CSS_FILES) >> $(CANDIDATES_DIR)/$(APP).css
	@echo "*** $(THISDIR): completed build ***"

package:
	@echo "*** $(THISDIR): completed package ***"

release:
	@echo "*** $(THISDIR): completed release ***"

clean:
	@echo "*** $(THISDIR): completed clean ***"

test:
	@echo "*** $(THISDIR): completed test ***"
