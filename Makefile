### license-check:    Check apisix-dashboard source code for Apache License
.PHONY: license-check
license-check:
ifeq ("$(wildcard .actions/openwhisk-utilities/scancode/scanCode.py)", "")
	git clone https://github.com/apache/openwhisk-utilities.git .actions/openwhisk-utilities
	cp .actions/ASF* .actions/openwhisk-utilities/scancode/
endif
	.actions/openwhisk-utilities/scancode/scanCode.py --config .actions/ASF-Release.cfg ./