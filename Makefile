.PHONY: all up logs down clean fclean build check-env re restart test test-unit test-health test-e2e prepare-socket elk
export CONTAINERS_REGISTRIES_CONF = $(shell pwd)/.containers/registries.conf
export PODMAN_COMPOSE_WARNING_LOGS=0

all: up

logs:
	podman compose logs -f

check-env:
ifeq (,$(wildcard .env))
	@printf "\033[41;37m ERROR \033[0m .env file not found! Please create one from your example file.\n"
	@exit 1
endif

up: check-env
	podman compose up -d
	podman compose logs -f

build: check-env
	podman compose build
	
down:
	podman compose down

elk: check-env
	podman compose --profile elk build 
	podman compose --profile elk up -d
	podman compose logs -f

clean:
	podman compose down -v

fclean:
	podman compose down -v --remove-orphans 2>/dev/null || true
	-podman ps -aq | xargs -r podman rm -f
	-podman images -aq | xargs -r podman rmi -f
	podman system prune -af --volumes
	-pkill -u $$(whoami) -f rootlessport 2>/dev/null || true
	rm -rf backend/dist backend/node_modules worker/node_modules

re:
	@$(MAKE) fclean
	@sleep 3
	@$(MAKE) all

restart: down up

# Run all test suites in sequence
test: test-unit test-health test-e2e

# Run unit tests in an isolated container
test-unit:
	podman compose run --rm backend npm test

# Check health against the active running backend service
test-health:
	@podman compose exec backend npm run health > /dev/null 2>&1 && \
		printf "\033[42m\033[30m PASS \033[0m Health check (GET /health)" || \
		(printf "\033[41m\033[37m FAIL \033[0m Health check (GET /health)" && exit 1)

# Run E2E tests in an isolated container (requests based tests)
test-e2e:
	podman compose run --rm backend npm run test:e2e