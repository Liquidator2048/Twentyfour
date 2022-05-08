YARN=yarn
DOCKER=docker
SQLJS_REPO=https://github.com/rhashimoto/wa-sqlite.git
SQLJS_CHECKOUT=a95a244a007c2c10435cb57633ab187e07fdd29f
DEVCONTAINER_NAME=localhost/twentyfour/sql.js-build

define build_container_run
$(DOCKER) run --rm -u "$(shell id -u):$(shell id -g)" -v "$(CURDIR)/$(1):/dist:Z" -w /dist $(DEVCONTAINER_NAME) bash -c '$(2)'
endef


build_container:
	$(DOCKER) build --pull -t $(DEVCONTAINER_NAME) build/

.PHONY: build/sql.js-clean
build/sql.js-clean:
	@cd build/sql.js && \
	$(MAKE) clean && \
	git reset --hard

build/sql.js:
	mkdir -p build
	git clone $(SQLJS_REPO) $@


build/sql.js-update: build/sql.js build/sql.js-clean
	@cd build/sql.js && \
	git pull origin master && \
	git checkout $(SQLJS_CHECKOUT) && \
	git apply ../sql.js.patch


src/wa-sqlite/wa-sqlite%: build/sql.js-update build_container
	$(call build_container_run,build/sql.js,yarn install && make -j"$$(($$(nproc) + 1))" || make)
	mkdir -p src/wa-sqlite/
	cp build/sql.js/dist/* src/wa-sqlite/

.PHONY: sql.js
sql.js: src/wa-sqlite/wa-sqlite.wasm src/wa-sqlite/wa-sqlite-async.mjs src/wa-sqlite/wa-sqlite-async.wasm src/wa-sqlite/wa-sqlite.mjs

.PHONY: build
build: sql.js
	$(YARN) install
	$(YARN) run build

.PHONY: all
.PHONY: build
all: build

.PHONY: build_in_docker
build_in_docker: sql.js build_container
	$(call build_container_run,.,yarn install && yarn run build)

clean:
	rm -rf build/sql.js
	rm -rf dist
	rm -rf node_modules .yarn
	rm src/wa-sqlite/wa-sqlite.wasm || true
	rm src/wa-sqlite/wa-sqlite-async.mjs || true
	rm src/wa-sqlite/wa-sqlite-async.wasm || true
	rm src/wa-sqlite/wa-sqlite.mjs || true
	$(DOCKER) rmi -f $(DEVCONTAINER_NAME)
