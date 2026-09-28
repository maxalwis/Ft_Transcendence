.PHONY: all up logs down elk clean fclean build check-env re restart test-unit test-health test-e2e prisma-studio tools seed elk-seed url
export CONTAINERS_REGISTRIES_CONF = $(shell pwd)/.containers/registries.conf
export PODMAN_COMPOSE_WARNING_LOGS=0
# The source IP for the default route, i.e. the interface actually facing the
# wifi/router — not just the first address `hostname -I` happens to list,
# which can be a virtual bridge (libvirt's virbr0, docker0, podman0, ...)
# that nothing outside this machine can reach.
LAN_IP := $(shell ip -4 route get 1.1.1.1 2>/dev/null | sed -n 's/.* src \([0-9.]*\).*/\1/p')
HTTPS_PORT := 8443

all: up

# Prints the link to hand to someone testing on the same wifi. LAN_IP is
# re-detected each run since it changes with the network/machine.
url:
	@printf "Local: \033[36mhttps://localhost:$(HTTPS_PORT)\033[0m\n"
	@printf "LAN:   \033[36mhttps://$(LAN_IP):$(HTTPS_PORT)\033[0m  (share this with testers on the same wifi)\n"

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

# ACTIVE_PROFILES tells the nginx container which admin-tool server blocks to
# enable (see nginx/entrypoint.sh); it must match the --profile flag below.
elk: check-env
	podman compose --profile elk build
	ACTIVE_PROFILES=elk podman compose --profile elk up -d
	podman compose logs -f

prisma-studio: check-env
	podman compose --profile prisma-studio build
	ACTIVE_PROFILES=prisma-studio podman compose --profile prisma-studio up -d
	podman compose logs -f

tools: check-env
	podman compose --profile tools build
	ACTIVE_PROFILES=tools podman compose --profile tools up -d
	podman compose logs -f

clean:
	podman compose down -v

fclean:
	podman compose --profile elk --profile prisma-studio --profile tools down -v --remove-orphans --rmi all 2>/dev/null || true
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

seed:
	podman compose exec backend npx prisma db seed

elk-seed:
	ENABLE_SEED_LOGS=true podman compose exec backend npx prisma db seed