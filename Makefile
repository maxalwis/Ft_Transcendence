.PHONY: all up down clean fclean build check-env re restart test test-unit test-health test-e2e

all: up

check-env:
ifeq (,$(wildcard .env))
	@echo "Error: .env file not found! Please create one from your example file."
	@exit 1
endif

up: check-env
	podman compose up --build

down:
	podman compose down

clean:
	podman compose down -v

fclean:
	podman compose down -v --rmi all --remove-orphans
	docker system prune -f --volumes
	rm -rf backend/dist backend/node_modules worker/node_modules backend/generated backend/tsconfig.build.tsbuildinfo

re: fclean all

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