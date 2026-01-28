import os
import json

class DPOData:
    """
    A class to handle DPO data loading and sampling.
    """
    def __init__(self, input_path: str, data_dir: str):
        """
        Initializes the DPOData object.

        Args:
            input_path: The path to the input data file.
            data_dir: The directory where the data is stored.
        """
        self.input_path = input_path
        self.data_dir = data_dir
        self.data = []

    def load_and_sample_data(self, sample_size: int = -1):
        """
        Loads data from the input file and optionally samples it.

        Args:
            sample_size: The number of samples to take. -1 means all data.
        """
        full_path = os.path.join(self.data_dir, self.input_path)
        print(f"Loading data from: {full_path}")
        
        try:
            with open(full_path, 'r') as f:
                self.data = [json.loads(line) for line in f]
            
            if sample_size != -1 and sample_size < len(self.data):
                # Basic sampling for demonstration
                self.data = self.data[:sample_size]
                print(f"Sampled {len(self.data)} records.")
        except FileNotFoundError:
            print(f"Error: File not found at {full_path}")
            self.data = []
        except Exception as e:
            print(f"An error occurred: {e}")
            self.data = []

# Example usage:
if __name__ == '__main__':
    # This is a placeholder for a real data directory and file
    # To run this example, create a 'data' directory and a 'dpo_data.jsonl' file in it.
    
    # Create a dummy data directory and file for testing
    if not os.path.exists('data'):
        os.makedirs('data')
    with open('data/dpo_data.jsonl', 'w') as f:
        for i in range(10):
            f.write(json.dumps({'prompt': f'prompt_{i}', 'chosen': f'chosen_{i}', 'rejected': f'rejected_{i}'}) + '\n')

    dpo_data = DPOData(input_path='dpo_data.jsonl', data_dir='data')
    dpo_data.load_and_sample_data(sample_size=5)
    
    print("\nLoaded and sampled data:")
    for record in dpo_data.data:
        print(record)
