.PHONY: start test start-dist test-dist benchmark lint check-coverage

# Start a docker-compose that will mount the current working dir as a volume and therefore use last sources without build
start:
	docker-compose -f docker-compose/docker-compose-dev.yml up --force-recreate

# Run the test suite from inside the container
test:
	rm -rf build/coverage ; docker-compose -f docker-compose/docker-compose-test.yml up --force-recreate

# Start a docker-compose that will build a new distributable image based on current sources
start-dist:
	docker-compose -f docker-compose/docker-compose-dist.yml build ; docker-compose -f docker-compose/docker-compose-dist.yml up

# Run the integration part of the test suite againt a new distributable image
test-dist:
	docker-compose -f docker-compose/docker-compose-dist.yml build ; docker-compose -f docker-compose/docker-compose-dist.yml up -d ; sleep 2 ; ./node_modules/.bin/mocha api/test/integration/*.js ; docker-compose -f docker-compose/docker-compose-dist.yml stop

# Run the benchmark part of the test suite againt a new distributable image
benchmark:
	docker-compose -f docker-compose/docker-compose-dist.yml build ; docker-compose -f docker-compose/docker-compose-dist.yml up -d ; sleep 2 ; mkdir -p build/benchmark-results ; rm -rf build/benchmark-results/* ; node api/test/benchmark/simple.js ; docker-compose -f docker-compose/docker-compose-dist.yml stop

lint:
	jscs -v . ; jshint .

check-coverage:
	./node_modules/.bin/istanbul check-coverage --statement 95

webpack:
	./node_modules/.bin/webpack --watch ux/src/docx-templater.js ux/bundles/docx-templater.js
