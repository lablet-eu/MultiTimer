class Timer {
    id: string
    dt: number
    t0: number = 0
    isSuspended: number
    timerCallback: () => void
    constructor(id: string, dt: number, body: () => void) {
        this.id = id
        this.dt = dt
        this.timerCallback = body
    }
    start(millis: number) {
        this.t0 = millis
        this.isSuspended = 0
    }
    check(t: number) {
        if (this.isSuspended) return
        if (this.t0 == 0) {
            this.t0 = t
            return
        }
        if (t - this.t0 > this.dt) {
            this.t0 = t
            this.timerCallback()
        }
    }
}

//% color=#0a59a8 weight=100 icon="\uf017" block="MultiTimer"
namespace MultiTimer {
    let timers: Timer[] = []
    let minDt: number = 1000
    let res: number = 200
    let t0: number
    //% blockId="MultitTimer_start"
    //% block="start all timers || with $resolution ms accuracy"
    export function start(resolution?: number) {
        if (timers == null) timers = []
        if (resolution) res = resolution
        t0 = control.millis()
        for (let timer of timers) {
            timer.start(t0)
        }
        control.inBackground(function () {
            while (true) {
                basic.pause(res)
                let t1 = control.millis()
                for (let timer of timers) {
                    timer.check(t1)
                }
            }
        })
    }
    //% blockId="MultitTimer_suspend"
    //% block="suspend timer $id"
    export function suspend(id: string) {
        for (let timer of timers) {
            if (timer.id == id) {
                timer.isSuspended = 1
            }
        }
    }
    //% blockId="MultitTimer_issuspended"
    //% block="timer $id is suspended?"
    export function isSuspended(id: string): number {
        for (let timer of timers) {
            if (timer.id == id) {
                return timer.isSuspended
            }
        }
        return -1
    }
    //% blockId="MultitTimer_restart"
    //% block="restart timer $id"
    export function restart(id: string) {
        for (let timer of timers) {
            if (timer.id == id) {
                if (timer.isSuspended) timer.start(control.millis())
            }
        }
    }
    //% blockId="MultitTimer_remove"
    //% block="remove timer $id"
    export function remove(id: string) {
        for (let timer of timers) {
            if (timer.id == id) {
                timers.removeElement(timer)
            }
        }
    }
    /**
     * Attaches code to run when the timer triggers an event.
     * @param id name of the timer
     * @param dt time difference between calls
     * @param body TODO
     */
    //% blockId="Timer_onTimerEvent"
    //% block="on $id timer event every $dt ms"
    export function onTimerEvent(id: string, dt: number, body: () => void): void {
        if (dt < 100) dt = 100
        if (dt < minDt) {
            minDt = dt
            res = minDt / 2
        }
        if (timers == null) timers = []
        timers.push(new Timer(id, dt, body))
    }
}