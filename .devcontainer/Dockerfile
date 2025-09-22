# Use the official Node.js 18 image
FROM node:18-bullseye

# Create a non-root user
ARG USERNAME=node
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Install additional OS packages
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    git \
    curl \
    && apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install TypeScript globally
RUN npm install -g typescript ts-node

# Set the default user
USER $USERNAMENode.js version (use -bullseye variants on local arm64/Apple Silicon): 18, 16, 14
ARG VARIANT="22-bullseye"
FROM mcr.microsoft.com/devcontainers/typescript-node:0-${VARIANT}

# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"
