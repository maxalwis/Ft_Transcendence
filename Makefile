.PHONY: all up down clean fclean re build check-env
.PHONY: all up down clean fclean re restart

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