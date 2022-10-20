SCRIPTS_DIR := scripts
UI := ui

.PHONY: build
build: install
	daml build
	daml codegen js
	./$(SCRIPTS_DIR)/build.sh
	cd $(UI) && npm run build

.PHONY: install
install:
	./$(SCRIPTS_DIR)/get-dependencies.sh daml.yaml
	cd $(UI) && npm install

.PHONY: clean
clean:
	daml clean
	./$(SCRIPTS_DIR)/remove-dependencies.sh daml.yaml
	cd $(SCRIPTS_DIR) && ./clean.sh
	rm -rf $(UI)/node_modules
	rm -rf $(UI)/daml.js
	rm -rf $(UI)/build

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

###################################
# CI															#
#		- utilises nix dependencies   #
#		- avoids unnecessary rebuilds #
###################################

.PHONY: ci-build
ci-build:
	@nix-shell \
		--pure   \
		--run 'make build'

.PHONY: ci-test
ci-test:
	@nix-shell \
		--pure   \
		--run 'daml test && cd $(SCRIPTS_DIR) && ./test.sh'

.PHONY: ci-headers-check
ci-headers-check:
	@nix-shell \
		--pure   \
		--run './scripts/dade-copyright-headers.py check'

.PHONY: ci-local
ci-local: clean ci-headers-check ci-build ci-test
