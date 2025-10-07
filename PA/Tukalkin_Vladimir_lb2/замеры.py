# quick_analysis.py - Упрощенный анализ
import pandas as pd
import matplotlib.pyplot as plt


def quick_analysis():
    """Быстрый анализ результатов"""
    try:
        df = pd.read_csv("cmake-build-debug/performance_report.csv")

        # Простой график
        plt.figure(figsize=(12, 6))

        configurations = df['Configuration']
        x = range(len(configurations))

        plt.plot(x, df['RoughBlockingList(s)'], 'ro-', label='RoughBlocking', linewidth=2)
        plt.plot(x, df['ThinBlockingList(s)'], 'bs-', label='ThinBlocking', linewidth=2)
        plt.plot(x, df['LockFreeList(s)'], 'g^-', label='LockFree', linewidth=2)

        plt.xlabel('Конфигурация потоков')
        plt.ylabel('Время выполнения (секунды)')
        plt.title('Сравнение производительности потокобезопасных списков')
        plt.xticks(x, configurations, rotation=45)
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.tight_layout()

        plt.savefig('quick_comparison.png', dpi=300, bbox_inches='tight')
        plt.show()

        # Вывод статистики
        print("\nБыстрая статистика:")
        print(f"RoughBlocking: среднее {df['RoughBlockingList(s)'].mean():.3f}s")
        print(f"ThinBlocking: среднее {df['ThinBlockingList(s)'].mean():.3f}s")
        print(f"LockFree: среднее {df['LockFreeList(s)'].mean():.3f}s")

    except FileNotFoundError:
        print("Файл performance_report.csv не найден")
        print("Сначала запустите C++ тестирование")


if __name__ == "__main__":
    quick_analysis()