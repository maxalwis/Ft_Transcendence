.PHONY: all up logs down clean fclean re restart

all: up

up:
	podman compose up -d --build
	podman compose logs -f

logs:
	podman compose logs -f

down:
	podman compose down

clean:
	podman compose down -v

fclean:
	podman compose down -v --rmi all --remove-orphans
	-pkill -u $$(whoami) -f rootlessport || true
	podman system prune -f --volumes
	rm -rf backend/dist backend/node_modules worker/node_modules

re:
	@$(MAKE) fclean
	@sleep 3
	@$(MAKE) all

restart : down up