from abc import ABC, abstractmethod
from loguru import logger


class BaseAgent(ABC):
    """
    Base class for all AI Agents.

    Every specialized agent inherits from this class.
    """

    def __init__(self, name: str):
        self.name = name

    def log_start(self):
        logger.info(f"{self.name} started.")

    def log_finish(self):
        logger.success(f"{self.name} completed.")

    def log_error(self, error):
        logger.error(f"{self.name}: {error}")

    @abstractmethod
    async def run(self, state):
        """
        Every agent MUST implement this method.
        """
        pass