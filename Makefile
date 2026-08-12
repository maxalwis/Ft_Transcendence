.PHONY: all up down clean fclean re build

all: up

up:
	podman compose up --build

down:
	podman compose down

clean:
	podman compose down -v

fclean:
	podman compose down -v --rmi all --remove-orphans
	docker system prune -f --volumes
	rm -rf backend/dist backend/node_modules worker/node_modules

re: fclean all