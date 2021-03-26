.PHONY: up

up:
	git add .
	git commit -am "update"
	git pull origin master
	git push origin master
	@echo "\n update 重新发布，需要调整静态资源路径 ..."


