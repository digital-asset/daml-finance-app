SCRIPTS_DIR := script

.PHONY: build
build: install
	daml build
	cd $(SCRIPTS_DIR) && ./build.sh

.PHONY: install
install:
	./$(SCRIPTS_DIR)/get-dependencies.sh daml.yaml

.PHONY: clean
clean:
	daml clean
	./$(SCRIPTS_DIR)/remove-dependencies.sh daml.yaml
	cd $(SCRIPTS_DIR) && ./clean.sh

.PHONY: test
test: build
	daml test
	cd $(SCRIPTS_DIR) && ./test.sh

.PHONY: headers-check
headers-check:
	./$(SCRIPTS_DIR)/dade-copyright-headers.py check

.PHONY: headers-update
headers-update:
	./$(SCRIPTS_DIR)/dade-copyright-headers.py update
