FROM ubuntu:22.04@sha256:0e5e4a57c2499249aafc3b40fcd541e9a456aab7296681a3994d631587203f97

ARG USERNAME=dev
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Create the user
RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m -s /bin/bash $USERNAME \
    && apt-get update \
    && apt-get install -y sudo \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

RUN apt-get update \
    && apt-get -y install --no-install-recommends \
    git vim curl ca-certificates sudo build-essential \
    && apt-get auto-remove -y \
    && apt-get clean -y 
USER $USERNAME

RUN curl https://sh.rustup.rs -sSf | sh -s -- -y

COPY .tool-versions ./.tool-versions

RUN curl https://mise.run | sh \
    && /home/$USERNAME/.local/bin/mise install \
    && /home/$USERNAME/.local/bin/mise reshim \
    && echo 'eval "$(/home/'$USERNAME'/.local/bin/mise activate bash)"' >> ~/.bashrc \
    && echo 'export PS1="\[\e[01;32m\]\u@\h\[\e[m\]:\[\e[01;34m\]\w\[\e[m\]\$ "' >> ~/.bashrc
